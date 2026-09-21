"use client";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { memo } from "react";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

const plugins = { code, math };
const controls = { code: true, table: true, mermaid: false };

export const MarkdownRenderer = memo(
  function MarkdownRenderer({
    content,
    isStreaming = false,
  }: MarkdownRendererProps) {
    // FAST PATH: during streaming, plain text (no parsing)
    if (isStreaming) {
      return (
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-900">
          {content}
        </div>
      );
    }

    // BEAUTIFUL PATH: after streaming, full markdown
    return (
      <div className="prose prose-neutral max-w-none text-sm leading-relaxed break-words">
        <Streamdown plugins={plugins} isAnimating={false} controls={controls}>
          {content}
        </Streamdown>
      </div>
    );
  },
  (prev, next) =>
    prev.content === next.content && prev.isStreaming === next.isStreaming
);
