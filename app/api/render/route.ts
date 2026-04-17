import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { TimelineSpec } from "@json-render/remotion";
import path from "path";
import fs from "fs";
import os from "os";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { spec } = (await req.json()) as { spec: TimelineSpec };

    if (!spec?.composition) {
      return new Response("Invalid spec: missing composition", { status: 400 });
    }

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
        inputProps: { spec },
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
        inputProps: { spec },
        jpegQuality: 80,
      });
    } catch (renderError) {
      console.error("Render failed:", renderError);
      await fs.promises.rm(tmpDir, { recursive: true }).catch(() => {});
      return new Response("Failed to render video", { status: 500 });
    }

    const videoBuffer = await fs.promises.readFile(outputPath);

    await fs.promises.rm(tmpDir, { recursive: true }).catch(() => {});

    return new Response(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="video.mp4"',
      },
    });
  } catch (error) {
    console.error("Render error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
