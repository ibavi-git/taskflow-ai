import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Edit3, FolderKanban, KanbanSquare, MoreHorizontal, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BoardDialog, ProjectDialog } from "@/components/app/EntityDialogs";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api";
import { useDeleteBoard, useDeleteProject, useGetProject, useListBoards } from "@workspace/api-client-react";
function ProjectDetail({ params }) {
  const routeParams = useParams();
  const projectId = Number(params?.projectId ?? routeParams.projectId ?? "0");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: project, isLoading: projectLoading } = useGetProject(projectId, { query: { enabled: Boolean(projectId) } });
  const { data: boards = [], isLoading: boardsLoading } = useListBoards(projectId, { query: { enabled: Boolean(projectId) } });
  const deleteProject = useDeleteProject();
  const deleteBoard = useDeleteBoard();
  if (projectLoading) {
    return <div className="mx-auto max-w-7xl space-y-6"><Skeleton className="h-12 w-72" /><Skeleton className="h-72 w-full" /></div>;
  }
  if (!project) return <div className="p-8 text-center">Project not found</div>;
  const completionPercentage = project.taskCount ? Math.round((project.completedTaskCount || 0) / project.taskCount * 100) : 0;
  const handleDeleteProject = () => {
    deleteProject.mutate(
      { projectId: project.id, workspaceId: project.workspaceId },
      {
        onSuccess: () => navigate(`/workspace/${project.workspaceId}`),
        onError: (error) => toast({ title: "Delete failed", description: getApiErrorMessage(error), variant: "destructive" })
      }
    );
  };
  return <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/projects" className="hover:text-foreground">Workspaces</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to={`/workspace/${project.workspaceId}`} className="hover:text-foreground">Workspace</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{project.name}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-4 w-4 rounded" style={{ backgroundColor: project.color || "hsl(var(--primary))" }} />
            <h1 className="text-3xl font-semibold tracking-normal">{project.name}</h1>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description || "No project description yet."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ProjectDialog workspaceId={project.workspaceId} project={project} trigger={<Button variant="outline"><Settings className="mr-2 h-4 w-4" />Edit project</Button>} />
          <ConfirmAction title="Delete project?" description="This deletes the project and its boards through the backend." onConfirm={handleDeleteProject}>
            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
          </ConfirmAction>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle>Project progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="text-3xl font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md border border-border p-3"><p className="text-muted-foreground">Boards</p><p className="text-lg font-semibold">{project.boardCount ?? boards.length}</p></div>
              <div className="rounded-md border border-border p-3"><p className="text-muted-foreground">Tasks</p><p className="text-lg font-semibold">{project.taskCount ?? 0}</p></div>
              <div className="rounded-md border border-border p-3"><p className="text-muted-foreground">Done</p><p className="text-lg font-semibold">{project.completedTaskCount ?? 0}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><KanbanSquare className="h-5 w-5 text-primary" />Boards</CardTitle>
              <CardDescription>Create, edit, delete, and open Kanban boards.</CardDescription>
            </div>
            <BoardDialog projectId={projectId} trigger={<Button><Plus className="mr-2 h-4 w-4" />New board</Button>} />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {boardsLoading ? Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-32" />) : boards.length ? boards.map((board) => <div key={board.id} className="rounded-md border border-border bg-background/60 p-4 transition hover:border-primary/45">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/board/${board.id}`} className="min-w-0">
                      <h3 className="truncate font-semibold hover:text-primary">{board.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{board.description || "No description"}</p>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <BoardDialog projectId={projectId} board={board} trigger={<DropdownMenuItem onSelect={(event) => event.preventDefault()}><Edit3 className="h-4 w-4" />Edit</DropdownMenuItem>} />
                        <ConfirmAction title="Delete board?" description="This deletes the board and contained lists/tasks." onConfirm={() => deleteBoard.mutate({ boardId: board.id, projectId })}>
                          <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                        </ConfirmAction>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button asChild className="mt-4" size="sm" variant="outline"><Link to={`/board/${board.id}`}><FolderKanban className="mr-2 h-4 w-4" />Open board</Link></Button>
                </div>) : <div className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
                  <KanbanSquare className="mx-auto mb-3 h-9 w-9 text-primary" />
                  <p>No boards yet.</p>
                </div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
export {
  ProjectDetail as default
};
