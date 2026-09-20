export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 px-4">
        <span className="text-sm font-medium">SOLO Chuin Workspace</span>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
