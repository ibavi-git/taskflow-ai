import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, FolderKanban, Plus, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/common/Loader";
import { getApiErrorMessage } from "@/services/api";
import { useCreateWorkspace, useListWorkspaces, type Workspace } from "@workspace/api-client-react";

export default function Projects() {
  const navigate = useNavigate();
  const { data: workspaces = [], isLoading, error } = useListWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setFormError("");

    try {
      const workspace = await createWorkspace.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setOpen(false);
      setName("");
      setDescription("");
      navigate(`/workspace/${workspace.id}`);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and open collaborative workspaces backed by the existing backend APIs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create workspace</DialogTitle>
              <DialogDescription>Set up a new team workspace to organize projects and tasks.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Marketing operations" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What this workspace is for" />
              </div>
              {formError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
              <DialogFooter>
                <Button type="submit" disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? "Creating..." : "Create workspace"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      {isLoading ? (
        <Loader label="Loading workspaces" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.length > 0 ? (
            workspaces.map((workspace: Workspace) => (
              <Card key={workspace.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{workspace.name}</CardTitle>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                      {workspace.projectCount} projects
                    </span>
                  </div>
                  <CardDescription>{workspace.description || "No description provided yet."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" />{workspace.memberCount} members</span>
                    <span className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{workspace.projectCount} projects</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="h-4 w-4" />Connected to TaskFlow backend</span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/workspace/${workspace.id}`}>Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              <FolderKanban className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p>No workspaces have been created yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
