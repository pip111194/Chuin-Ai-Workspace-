"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");

  const { messages, append, isLoading, error, stop } = useChat({
    api: "/api/chat",
  });

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    append({ role: "user", content: input });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-sm font-medium text-neutral-900">Chuin AI</p>
              <p className="mt-1 text-sm text-neutral-500">
                Ask anything - real AI responses.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-auto max-w-2xl rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white"
                  : "max-w-2xl whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
              }
            >
              {m.content || ""}
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Error: {error.message}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-900" />
              <span className="text-xs text-neutral-500">Chuin is thinking...</span>
              <button
                onClick={stop}
                className="ml-auto text-xs text-neutral-500 hover:text-neutral-900"
              >
                Stop
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto max-w-3xl"
        >
          <div className="glass rounded-2xl p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Chuin anything..."
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
              rows={1}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500">Attach</span>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40"
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
