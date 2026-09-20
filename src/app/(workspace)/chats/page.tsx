import Link from "next/link";

export default function ChatsPage() {
  const chats: Array<{ id: string; title: string; preview: string; time: string }> = [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Chats</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Your conversation history
            </p>
          </div>
          <Link
            href="/chat/new"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            New Chat
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {chats.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-base font-medium text-neutral-900">
              No chats yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Start a new conversation with Chuin and it will appear here.
            </p>
            <Link
              href="/chat/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Start your first chat
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-2">
            {chats.map((chat) => (
              <Link key={chat.id} href={`/chat/${chat.id}`} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{chat.title}</p>
                  <p className="mt-1 truncate text-xs text-neutral-500">{chat.preview}</p>
                </div>
                <span className="ml-3 shrink-0 text-xs text-neutral-400">{chat.time}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
