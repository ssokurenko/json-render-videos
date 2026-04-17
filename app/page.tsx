"use client";

import { useState, useCallback, useRef } from "react";
import { createSpecStreamCompiler } from "@json-render/core";
import { PlayerRef } from "@remotion/player";
import { type TimelineSpec } from "@json-render/remotion";
import { JsonPanel } from "./components/JsonPanel";
import { VideoPanel } from "./components/VideoPanel";

function isSpecComplete(spec: TimelineSpec): spec is Required<TimelineSpec> {
  return !!(
    spec.composition &&
    spec.tracks &&
    Array.isArray(spec.clips) &&
    spec.clips.length > 0
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [spec, setSpec] = useState<TimelineSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const generate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSpec(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      const compiler = createSpecStreamCompiler<TimelineSpec>();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const { result, newPatches } = compiler.push(chunk);

        if (newPatches.length > 0) {
          setSpec(result);
        }
      }

      const finalSpec = compiler.getResult();
      setSpec(finalSpec);

      if (isSpecComplete(finalSpec)) {
        setTimeout(() => {
          playerRef.current?.play();
        }, 100);
      } else {
        setError("Generated timeline is incomplete");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleExport = useCallback(() => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timeline.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [spec]);

  const handleRender = useCallback(async () => {
    if (!spec) return;

    setIsRendering(true);
    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });

      if (!response.ok) {
        throw new Error("Render failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setIsRendering(false);
    }
  }, [spec]);

  return (
    <div className="min-h-screen">
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-6">
          JSON Render Videos
        </h1>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="border border-border rounded p-3 bg-background font-mono text-sm flex items-center gap-2">
              <span className="text-muted-foreground">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50"
                disabled={isGenerating}
                maxLength={500}
              />
              {isGenerating ? (
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-30"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            <JsonPanel spec={spec} isGenerating={isGenerating} />
            <VideoPanel
              spec={spec}
              isGenerating={isGenerating}
              isRendering={isRendering}
              playerRef={playerRef}
              onExport={handleExport}
              onRender={handleRender}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
