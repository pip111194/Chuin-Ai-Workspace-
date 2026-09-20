"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

interface PendingFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
}

export default function ChatPage() {
  const params = useParams();
  const urlId = params.id as string;
  const isNew = urlId === "new";

  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(
    isNew ? null : urlId
  );
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, append, isLoading, error, stop, setMessages } = useChat({
    api: "/api/chat",
    onFinish: async (message) => {
      if (!conversationId) return;
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            role: "assistant",
            content: message.content,
          }),
        });
      } catch (e) {
        console.error("Failed to save assistant message:", e);
      }
    },
  });

  useEffect(() => {
    if (isNew || historyLoaded) return;
    fetch(`/api/conversations/${urlId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages && setMessages) {
          setMessages(
            data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))
          );
        }
      })
      .catch((e) => console.error("Failed to load history:", e))
      .finally(() => setHistoryLoaded(true));
  }, [urlId, isNew, historyLoaded, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploaded: PendingFile[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        uploaded.push(data.attachment);
      } catch (err) {
        console.error("Upload failed:", err);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setPendingFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingFiles.length === 0) || isLoading || uploading)
      return;

    const userMessage = input.trim();
    setInput("");

    let finalContent = userMessage;
    if (pendingFiles.length > 0) {
      const fileList = pendingFiles
        .map((f) => `📎 ${f.name}`)
        .join("\n");
      finalContent = userMessage
        ? `${userMessage}\n\n[Attached files:]\n${fileList}`
        : `[Attached files:]\n${fileList}`;
    }

    const currentPendingFiles = [...pendingFiles];
    setPendingFiles([]);

    let currentConvId = conversationId;

    if (!currentConvId) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: (userMessage || currentPendingFiles[0]?.name || "New Chat")
              .trim()
              .slice(0, 40),
          }),
        });
        const data = await res.json();
        if (data.conversation?.id) {
          currentConvId = data.conversation.id;
          setConversationId(currentConvId);
          window.history.replaceState(null, "", `/chat/${currentConvId}`);
        }
      } catch (e) {
        console.error("Failed to create conversation:", e);
      }
    }

    if (currentConvId) {
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: currentConvId,
            role: "user",
            content: finalContent,
          }),
        });
      } catch (e) {
        console.error("Failed to save user message:", e);
      }
    }

    append({ role: "user", content: finalContent });
  };

  const handleNewChat = () => {
    window.location.href = "/chat/new";
  };

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
                Chuin AI Workspace
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Build. Explore. Create. Iterate.
              </p>

              <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-2">
                {[
                  { label: "Build a website", icon: "🌐" },
                  { label: "Create an app", icon: "📱" },
                  { label: "Explain code", icon: "💡" },
                  { label: "Debug a project", icon: "🔧" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setInput(item.label)}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm text-neutral-700 transition-all hover:border-neutral-300 hover:shadow-sm"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-neutral-900 px-4 py-3 text-sm text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed text-neutral-900">
                    {m.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Error: {error.message}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-neutral-500">Chuin is thinking</span>
              <button onClick={stop} className="ml-2 text-xs text-neutral-500 underline hover:text-neutral-900">
                Stop
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-4 pb-4 pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto max-w-3xl"
        >
          <div className="glass rounded-2xl border border-neutral-200 bg-white/80 p-3 shadow-sm backdrop-blur-xl transition-shadow focus-within:border-neutral-300 focus-within:shadow-md">
            {pendingFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {pendingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="max-w-[120px] truncate text-neutral-700">{file.name}</span>
                    <span className="text-neutral-400">{formatSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => removePendingFile(file.id)}
                      className="text-neutral-400 hover:text-neutral-900"
                      aria-label="Remove file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Chuin anything..."
              className="max-h-[200px] min-h-[44px] w-full resize-none bg-transparent px-1 py-1 text-[15px] leading-relaxed outline-none placeholder:text-neutral-400"
              rows={1}
              disabled={isLoading}
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || isLoading}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
                  aria-label="Attach file"
                >
                  {uploading ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={(!input.trim() && pendingFiles.length === 0) || isLoading || uploading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
