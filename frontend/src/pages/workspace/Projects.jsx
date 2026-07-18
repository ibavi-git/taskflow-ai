import { Link } from "react-router-dom";
import { Briefcase, Edit3, FolderKanban, MoreHorizontal, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader } from "@/components/common/Loader";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { WorkspaceDialog } from "@/components/app/EntityDialogs";
import { getApiErrorMessage } from "@/services/api";
import { useDeleteWorkspace, useListWorkspaces } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
function Projects() {
  const { data: workspaces = [], isLoading, error } = useListWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const { toast } = useToast();
  const handleDelete = (workspaceId) => {
    deleteWorkspace.mutate(
      { workspaceId },
      {
        onSuccess: () => toast({ title: "Workspace deleted" }),
        onError: (err) => toast({ title: "Delete failed", description: getApiErrorMessage(err), variant: "destructive" })
      }
    );
  };
  return <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Workspaces</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Workspaces are the top-level entities that contain projects, boards, and tasks. You can create multiple workspaces to organize your work.</p>
        </div>
        <WorkspaceDialog trigger={<Button><Plus className="mr-2 h-4 w-4" />New workspace</Button>} />
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      {isLoading ? <Loader label="Loading workspaces" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.length > 0 ? workspaces.map((workspace) => <Card key={workspace.id} className="border-border bg-card transition hover:border-primary/45">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/workspace/${workspace.id}`} className="min-w-0">
                      <CardTitle className="truncate text-lg hover:text-primary">{workspace.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{workspace.description || "No description provided yet."}</CardDescription>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Workspace actions"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <WorkspaceDialog
    workspace={workspace}
    trigger={<DropdownMenuItem onSelect={(event) => event.preventDefault()}><Edit3 className="h-4 w-4" />Edit</DropdownMenuItem>}
  />
                        <ConfirmAction
    title="Delete workspace?"
    description="This removes the workspace and its child entities from the backend."
    onConfirm={() => handleDelete(workspace.id)}
  >
                          <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                        </ConfirmAction>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" />{workspace.memberCount} members</span>
                    <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{workspace.projectCount} projects</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4" />Backend connected</span>
                    <Button asChild variant="outline" size="sm"><Link to={`/workspace/${workspace.id}`}>Open</Link></Button>
                  </div>
                </CardContent>
              </Card>) : <div className="col-span-full rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              <FolderKanban className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p>No workspaces have been created yet.</p>
            </div>}
        </div>}
    </div>;
}
export {
  Projects as default
};
