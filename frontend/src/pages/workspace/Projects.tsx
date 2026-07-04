import { FolderKanban } from "lucide-react";

export default function Projects() {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8">
      <FolderKanban className="mb-4 h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold tracking-normal">Projects</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The projects module will be built next against `/api/workspaces/:workspaceId/projects` and
        `/api/projects/:projectId`.
      </p>
    </div>
  );
}
