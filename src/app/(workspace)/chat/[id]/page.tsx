export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-500">
              Conversation ID: <code className="font-mono text-neutral-900">{id}</code>
            </p>
            <p className="mt-2 text-sm text-neutral-700">
              Chuin AI workspace ready. Composer coming next.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 p-4">
        <div className="mx-auto max-w-3xl">
          <div className="glass rounded-2xl p-3">
            <textarea
              placeholder="Ask Chuin anything..."
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-neutral-400"
              rows={1}
            />
            <div className="flex items-center justify-between pt-2">
              <button className="text-xs text-neutral-500 hover:text-neutral-900">
                Attach
              </button>
              <button className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
