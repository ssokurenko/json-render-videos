import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { TimelineSpec } from "@json-render/remotion";
import path from "path";
import fs from "fs";
import os from "os";
import http from "http";

export const maxDuration = 300;

async function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === "https:" ? require("https") : http;

    const request = protocol.get(url, (response: any) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err: any) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });

    file.on("error", (err: any) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function startImageServer(
  cacheDir: string
): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(404);
        res.end();
        return;
      }

      const filePath = path.join(cacheDir, path.basename(req.url));

      if (!filePath.startsWith(cacheDir)) {
        res.writeHead(403);
        res.end();
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end();
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
        };

        res.writeHead(200, {
          "Content-Type": mimeTypes[ext] || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
        });
        res.end(data);
      });
    });

    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Failed to start server"));
        return;
      }

      const port = addr.port;
      resolve({
        port,
        close: () =>
          new Promise<void>((resolveClose) => {
            server.close(() => {
              resolveClose();
            });
          }),
      });
    });

    server.on("error", reject);
  });
}

async function downloadAndCacheImages(
  spec: TimelineSpec,
  cacheDir: string,
  serverPort: number
): Promise<TimelineSpec> {
  if (!spec?.clips) {
    return spec;
  }

  const imageMap = new Map<string, string>();
  const imageUrls = new Set<string>();

  spec.clips.forEach((clip: any) => {
    if (clip.props?.src && typeof clip.props.src === "string") {
      imageUrls.add(clip.props.src);
    }
    if (
      clip.props?.backgroundImageSrc &&
      typeof clip.props.backgroundImageSrc === "string"
    ) {
      imageUrls.add(clip.props.backgroundImageSrc);
    }
  });

  await Promise.all(
    Array.from(imageUrls).map(async (url) => {
      const fileName = `img-${Buffer.from(url).toString("base64").substring(0, 20)}.jpg`;
      const filePath = path.join(cacheDir, fileName);

      if (!fs.existsSync(filePath)) {
        try {
          await downloadImage(url, filePath);
        } catch (err) {
          console.warn(`Failed to download image ${url}:`, err);
          return;
        }
      }

      imageMap.set(url, `http://127.0.0.1:${serverPort}/${fileName}`);
    })
  );

  const newSpec = JSON.parse(JSON.stringify(spec)) as TimelineSpec;

  newSpec.clips?.forEach((clip: any) => {
    if (clip.props?.src && imageMap.has(clip.props.src)) {
      clip.props.src = imageMap.get(clip.props.src);
    }
    if (
      clip.props?.backgroundImageSrc &&
      imageMap.has(clip.props.backgroundImageSrc)
    ) {
      clip.props.backgroundImageSrc = imageMap.get(
        clip.props.backgroundImageSrc
      );
    }
  });

  return newSpec;
}

export async function POST(req: Request) {
  let cacheDir: string | null = null;
  let server: Awaited<ReturnType<typeof startImageServer>> | null = null;

  try {
    const { spec } = (await req.json()) as { spec: TimelineSpec };

    if (!spec?.composition) {
      return new Response("Invalid spec: missing composition", { status: 400 });
    }

    cacheDir = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "image-cache-")
    );

    server = await startImageServer(cacheDir);
    const cachedSpec = await downloadAndCacheImages(
      spec,
      cacheDir,
      server.port
    );

    const entryPoint = path.join(process.cwd(), "remotion", "index.ts");

    let bundleLocation: string;
    try {
      bundleLocation = await bundle({
        entryPoint,
      });
    } catch (bundleError) {
      console.error("Bundle failed:", bundleError);
      return new Response("Failed to bundle remotion project", { status: 500 });
    }

    let composition;
    try {
      composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "timeline",
        inputProps: { spec: cachedSpec },
      });
    } catch (selectError) {
      console.error("Select composition failed:", selectError);
      return new Response("Failed to select composition", { status: 500 });
    }

    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "render-"));
    const outputPath = path.join(tmpDir, "video.mp4");

    try {
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: { spec: cachedSpec },
        jpegQuality: 80,
      });
    } catch (renderError) {
      console.error("Render failed:", renderError);
      await fs.promises.rm(tmpDir, { recursive: true }).catch(() => {});
      return new Response("Failed to render video", { status: 500 });
    }

    const videoBuffer = await fs.promises.readFile(outputPath);

    await fs.promises.rm(tmpDir, { recursive: true }).catch(() => {});
    if (cacheDir) {
      await fs.promises.rm(cacheDir, { recursive: true }).catch(() => {});
    }
    if (server) {
      await server.close();
    }

    return new Response(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="video.mp4"',
      },
    });
  } catch (error) {
    console.error("Render error:", error);
    if (cacheDir) {
      await fs.promises.rm(cacheDir, { recursive: true }).catch(() => {});
    }
    if (server) {
      await server.close().catch(() => {});
    }
    return new Response("Internal server error", { status: 500 });
  }
}
