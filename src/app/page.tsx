import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">
            Chuin AI Workspace
          </h1>
          <p className="text-neutral-500">
            Build. Explore. Create. Iterate.
          </p>
        </div>

        <Link
          href="/chat/new"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Start New Chat
        </Link>

        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4">
          {["Build a website", "Create an app", "Explain code", "Debug a project"].map(
            (label) => (
              <button
                key={label}
                className="rounded-lg border border-neutral-200 px-4 py-3 text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>
    </main>
  );
}
