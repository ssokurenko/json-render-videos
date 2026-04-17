"use client";

import { TimelineSpec } from "@json-render/remotion";
import { Player, PlayerRef } from "@remotion/player";
import { Renderer } from "@json-render/remotion";

interface VideoPanelProps {
  spec: TimelineSpec | null;
  isGenerating: boolean;
  isRendering: boolean;
  playerRef: React.RefObject<PlayerRef | null>;
  onExport: () => void;
  onRender: () => void;
}

function isSpecComplete(spec: TimelineSpec): spec is Required<TimelineSpec> {
  return !!(
    spec.composition &&
    spec.tracks &&
    Array.isArray(spec.clips) &&
    spec.clips.length > 0
  );
}

export function VideoPanel({
  spec,
  isGenerating,
  isRendering,
  playerRef,
  onExport,
  onRender,
}: VideoPanelProps) {
  const hasCompleteSpec = spec && isSpecComplete(spec);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 h-6">
        <span className="text-xs font-mono text-muted-foreground">preview</span>
        <div className="flex items-center gap-2">
          {hasCompleteSpec && (
            <>
              <button
                onClick={onExport}
                className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
                title="Export timeline JSON"
              >
                Export
              </button>
              <button
                onClick={onRender}
                disabled={isRendering}
                className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Render video to MP4"
              >
                {isRendering ? (
                  <>
                    <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  "Render MP4"
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <div
        className="border border-border rounded bg-black h-[28rem] relative overflow-hidden"
        data-player-container
      >
        {spec && isSpecComplete(spec) ? (
          <Player
            ref={playerRef}
            component={Renderer}
            inputProps={{ spec }}
            durationInFrames={spec.composition.durationInFrames}
            fps={spec.composition.fps}
            compositionWidth={spec.composition.width}
            compositionHeight={spec.composition.height}
            style={{
              width: "100%",
              height: "100%",
            }}
            controls
            loop
          />
        ) : (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span>Generating timeline...</span>
              </div>
            ) : spec ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
                <span>Building timeline...</span>
              </div>
            ) : (
              "Enter a prompt to generate a video"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
