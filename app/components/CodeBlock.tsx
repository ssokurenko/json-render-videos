"use client";

import { useState, useEffect } from "react";
import { createHighlighter, type Highlighter } from "shiki";

const darkTheme = {
  name: "custom-dark",
  type: "dark" as const,
  colors: {
    "editor.background": "transparent",
    "editor.foreground": "#EDEDED",
  },
  settings: [
    {
      scope: ["string", "string.quoted"],
      settings: { foreground: "#50E3C2" },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language.boolean",
        "constant.language.null",
      ],
      settings: { foreground: "#50E3C2" },
    },
    {
      scope: ["punctuation", "meta.brace", "meta.bracket"],
      settings: { foreground: "#888888" },
    },
    {
      scope: ["support.type.property-name", "entity.name.tag.json"],
      settings: { foreground: "#EDEDED" },
    },
  ],
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [darkTheme],
      langs: ["json"],
    });
  }
  return highlighterPromise;
}

if (typeof window !== "undefined") {
  getHighlighter();
}

export function CodeBlock({ code }: { code: string }) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    getHighlighter().then((highlighter) => {
      setHtml(
        highlighter.codeToHtml(code, {
          lang: "json",
          theme: "custom-dark",
        }),
      );
    });
  }, [code]);

  if (!html) {
    return (
      <pre className="p-4 text-left">
        <code className="text-muted-foreground">{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="p-4 text-[13px] leading-relaxed [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0! [&_code]:bg-transparent!"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
