import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Briefcase, ChevronRight, Edit3, FolderKanban, Mail, MoreHorizontal, Plus, Settings, Tag, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { LabelDialog, ProjectDialog, WorkspaceDialog } from "@/components/app/EntityDialogs";
import { getApiErrorMessage } from "@/services/api";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useAddWorkspaceMember,
  useDeleteLabel,
  useDeleteProject,
  useDeleteWorkspace,
  useGetWorkspace,
  useListLabels,
  useListProjects,
  useListWorkspaceMembers,
  useRemoveWorkspaceMember
} from "@workspace/api-client-react";
function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace(id, { query: { enabled: Boolean(id) } });
  const { data: projects = [], isLoading: projectsLoading } = useListProjects(id, { query: { enabled: Boolean(workspaceId) } });
  const { data: members = [], isLoading: membersLoading } = useListWorkspaceMembers(id, { query: { enabled: Boolean(workspaceId) } });
  const { data: labels = [], isLoading: labelsLoading } = useListLabels(id, { query: { enabled: Boolean(workspaceId) } });
  const addMember = useAddWorkspaceMember();
  const removeMember = useRemoveWorkspaceMember();
  const deleteWorkspace = useDeleteWorkspace();
  const deleteProject = useDeleteProject();
  const deleteLabel = useDeleteLabel();
  const [memberOpen, setMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");
  const handleInvite = async (event) => {
    event.preventDefault();
    try {
      await addMember.mutateAsync({ workspaceId: id, data: { email: memberEmail, role: memberRole } });
      toast({ title: "Member invited" });
      setMemberOpen(false);
      setMemberEmail("");
      setMemberRole("MEMBER");
    } catch (error) {
      toast({ title: "Invite failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  if (workspaceLoading) {
    return <div className="mx-auto max-w-7xl space-y-6"><Skeleton className="h-14 w-80" /><Skeleton className="h-80 w-full" /></div>;
  }
  if (!workspace) return <div className="p-8 text-center">Workspace not found</div>;
  return <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/projects" className="hover:text-foreground">Workspaces</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{workspace.name}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-4">

  <div
    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white"
    style={{
      backgroundColor: workspace.color || "hsl(var(--primary))"
    }}
  >
    {getInitials(workspace.name)}
  </div>

  <div className="flex-1">

    <h1 className="text-3xl font-bold">
      {workspace.name}
    </h1>

    <p className="mt-2 text-muted-foreground">
      {workspace.description || "No workspace description yet."}
    </p>

    {
    /* Workspace Statistics */
  }
    <div className="mt-5 flex flex-wrap gap-4">

      <Card className="px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Projects
        </p>

        <p className="text-2xl font-bold">
          {projects.length}
        </p>
      </Card>

      <Card className="px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Members
        </p>

        <p className="text-2xl font-bold">
          {members.length}
        </p>
      </Card>

      <Card className="px-5 py-3">
        <p className="text-xs text-muted-foreground">
          Labels
        </p>

        <p className="text-2xl font-bold">
          {labels.length}
        </p>
      </Card>

    </div>

  </div>

</div>
        <div className="flex flex-wrap gap-2">
          <WorkspaceDialog workspace={workspace} trigger={<Button variant="outline"><Settings className="mr-2 h-4 w-4" />Edit workspace</Button>} />
          <ConfirmAction
    title="Delete workspace?"
    description="This will delete this workspace through the backend API."
    onConfirm={() => deleteWorkspace.mutate({ workspaceId: id }, { onSuccess: () => navigate("/projects") })}
  >
            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          </ConfirmAction>
        </div>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects"><FolderKanban className="mr-2 h-4 w-4" />Projects</TabsTrigger>
          <TabsTrigger value="members"><Users className="mr-2 h-4 w-4" />Members</TabsTrigger>
          <TabsTrigger value="labels"><Tag className="mr-2 h-4 w-4" />Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <ProjectDialog workspaceId={id} trigger={<Button><Plus className="mr-2 h-4 w-4" />New project</Button>} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectsLoading ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44" />) : projects.length ? projects.map((project) => <Card key={project.id} className="border-border bg-card transition hover:border-primary/45">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/project/${project.id}`} className="min-w-0">
                      <CardTitle className="truncate text-base hover:text-primary">{project.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">{project.description || "No description"}</CardDescription>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ProjectDialog workspaceId={id} project={project} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit3 className="h-4 w-4" />Edit</DropdownMenuItem>} />
                        <ConfirmAction title="Delete project?" description="This deletes the project from the backend." onConfirm={() => deleteProject.mutate({ projectId: project.id, workspaceId: id })}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                        </ConfirmAction>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="space-y-2">

  <Badge variant="outline">
    {project.status}
  </Badge>

  <div className="flex items-center justify-between text-sm">

    <div className="flex items-center gap-2">
      <Briefcase className="h-4 w-4 text-primary" />
      <span>{project.taskCount ?? 0} {project.taskCount === 1 ? "Task" : "Tasks"}</span>
    </div>

    <div className="flex items-center gap-2">
      <FolderKanban className="h-4 w-4 text-primary" />
      <span>{project.boardCount ?? 0} {project.boardCount === 1 ? "Board" : "Boards"}</span>
    </div>

  </div>

</div>
                  <Button asChild variant="outline" size="sm"><Link to={`/project/${project.id}`}>Open project</Link></Button>
                </CardContent>
              </Card>) : <div className="col-span-full rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
                <FolderKanban className="mx-auto mb-3 h-9 w-9 text-primary" />
                <p>No projects yet.</p>
              </div>}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Workspace members</CardTitle>
                <CardDescription>Invite, list, and remove members with the existing workspace member APIs.</CardDescription>
              </div>
              <Dialog open={memberOpen} onOpenChange={setMemberOpen}>
                <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Invite</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite member</DialogTitle>
                    <DialogDescription>Add a user by email and role.</DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleInvite}>
                    <label className="space-y-2 block">
                      <span className="text-sm font-medium">Email</span>
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><Input type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} required /></div>
                    </label>
                    <label className="space-y-2 block">
                      <span className="text-sm font-medium">Role</span>
                      <Select value={memberRole} onValueChange={setMemberRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="MEMBER">MEMBER</SelectItem><SelectItem value="ADMIN">ADMIN</SelectItem></SelectContent>
                      </Select>
                    </label>
                    <DialogFooter><Button type="submit" disabled={addMember.isPending}>Send invite</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {membersLoading ? <div className="p-4"><Skeleton className="h-24" /></div> : members.length ? members.map((member) => <div key={member.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar><AvatarImage src={member.user?.avatar || void 0} /><AvatarFallback>{getInitials(member.user?.name || "User")}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.user?.name || "Unknown user"}</p>
                      <p className="truncate text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.role}</Badge>
                    {workspace.ownerId !== member.userId ? <ConfirmAction title="Remove member?" description="This removes the member from the workspace." onConfirm={() => removeMember.mutate({ workspaceId: id, userId: member.userId })}>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </ConfirmAction> : null}
                  </div>
                </div>) : <div className="p-8 text-center text-muted-foreground">No members returned.</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <LabelDialog workspaceId={id} trigger={<Button><Plus className="mr-2 h-4 w-4" />New label</Button>} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {labelsLoading ? <Skeleton className="h-24" /> : labels.length ? labels.map((label) => <div key={label.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded" style={{ backgroundColor: label.color }} />
                  <span className="font-medium">{label.name}</span>
                </div>
                <div className="flex gap-1">
                  <LabelDialog workspaceId={id} label={label} trigger={<Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>} />
                  <ConfirmAction title="Delete label?" description="This deletes the workspace label." onConfirm={() => deleteLabel.mutate({ workspaceId: id, labelId: label.id })}>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </ConfirmAction>
                </div>
              </div>) : <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">No labels yet.</div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}
export {
  WorkspaceDetail as default
};
