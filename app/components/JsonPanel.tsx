"use client";

import { TimelineSpec } from "@json-render/remotion";
import { CodeBlock } from "./CodeBlock";
import { CopyButton } from "./CopyButton";

interface JsonPanelProps {
  spec: TimelineSpec | null;
  isGenerating: boolean;
}

export function JsonPanel({ spec, isGenerating }: JsonPanelProps) {
  return (
    <div className="text-left">
      <div className="flex items-center gap-4 mb-2 h-6">
        <span className="text-xs font-mono text-muted-foreground">json</span>
        {isGenerating && (
          <span className="text-xs text-muted-foreground animate-pulse">
            generating...
          </span>
        )}
      </div>
      <div className="border border-border rounded bg-background font-mono text-xs h-[28rem] overflow-auto relative group">
        {spec && (
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={JSON.stringify(spec, null, 2)} />
          </div>
        )}
        {spec ? (
          <CodeBlock code={JSON.stringify(spec, null, 2)} />
        ) : isGenerating ? (
          <div className="p-4 text-muted-foreground/50 h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
              <span>Generating timeline...</span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-muted-foreground/50 h-full flex items-center justify-center">
            Enter a prompt to generate a video timeline
          </div>
        )}
      </div>
    </div>
  );
}
