export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Project</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Project ID: <code className="font-mono">{id}</code>
      </p>
    </div>
  );
}
