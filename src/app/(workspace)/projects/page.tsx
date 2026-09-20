"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
      })
      .catch((e) => console.error("Failed to load projects:", e))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Projects</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Your software projects
            </p>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Project
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-sm text-neutral-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
            </div>
            <h2 className="mt-4 text-base font-medium text-neutral-900">
              No projects yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              Ask Chuin to build a project and it will appear here.
            </p>
            <Link
              href="/projects/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <p className="truncate text-sm font-medium text-neutral-900">
                  {project.name}
                </p>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                    {project.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-neutral-400">
                  {formatDate(project.updatedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
