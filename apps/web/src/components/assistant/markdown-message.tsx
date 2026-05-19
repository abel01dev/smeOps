"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export function MarkdownMessage({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm prose-slate max-w-none",
        "prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
        "prose-headings:my-2 prose-headings:font-semibold",
        "prose-pre:my-2 prose-pre:rounded-lg prose-pre:bg-slate-900 prose-pre:text-slate-50",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
