import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-6 py-5">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Projects
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-1 text-sm text-neutral-500">{project.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {project.status}
              </span>
              <span>·</span>
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="mt-4 text-sm text-neutral-700">
              This project is ready. Open a chat to start building with Chuin.
            </p>

            <Link
              href="/chat/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Start Building
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
