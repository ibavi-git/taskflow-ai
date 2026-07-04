// @ts-nocheck
import React, { useState } from "react";
import { Link } from "wouter";
import { 
  useGetProject,
  useListBoards,
  useCreateBoard,
  getGetProjectQueryKey,
  getListBoardsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  FolderKanban, 
  Plus, 
  Settings,
  ChevronRight,
  KanbanSquare,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function ProjectDetail({ params }: { params: { projectId: string } }) {
  const projectId = parseInt(params.projectId);
  const queryClient = useQueryClient();
  
  const { data: project, isLoading: projectLoading } = useGetProject(projectId, {
    query: { enabled: !!projectId, queryKey: getGetProjectQueryKey(projectId) }
  });
  
  const { data: boards, isLoading: boardsLoading } = useListBoards(projectId, {
    query: { enabled: !!projectId, queryKey: getListBoardsQueryKey(projectId) }
  });

  const createBoard = useCreateBoard();

  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [boardDesc, setBoardDesc] = useState("");

  const handleCreateBoard = () => {
    if (!boardName) return;
    createBoard.mutate(
      { 
        projectId,
        data: { name: boardName, description: boardDesc } 
      },
      {
        onSuccess: () => {
          setIsBoardOpen(false);
          setBoardName("");
          setBoardDesc("");
          queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(projectId) });
        }
      }
    );
  };

  if (projectLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center">Project not found</div>;
  }

  const completionPercentage = project.taskCount 
    ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/workspace/${project.workspaceId}`} className="hover:text-foreground transition-colors">Workspace</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="h-4 w-4 rounded-full" 
              style={{ backgroundColor: project.color || 'var(--primary)' }}
            />
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="ml-2 uppercase text-[10px] tracking-wider">
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Project Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-end text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-bold text-lg">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span>{project.completedTaskCount || 0} completed</span>
                <span>{project.taskCount || 0} total tasks</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-primary" />
              Boards
            </h2>
            <Dialog open={isBoardOpen} onOpenChange={setIsBoardOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Board</DialogTitle>
                  <DialogDescription>A board organizes tasks into lists like a Kanban.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input value={boardName} onChange={(e) => setBoardName(e.target.value)} placeholder="e.g. Sprint 42" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea value={boardDesc} onChange={(e) => setBoardDesc(e.target.value)} placeholder="Optional details..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={!boardName || createBoard.isPending} onClick={handleCreateBoard}>
                    {createBoard.isPending ? "Creating..." : "Create Board"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {boardsLoading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-32" />)
            ) : boards && boards.length > 0 ? (
              boards.map(board => (
                <Link key={board.id} href={`/board/${board.id}`}>
                  <Card className="bg-card hover:bg-accent hover-elevate border-border cursor-pointer h-full transition-all group">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                        {board.name}
                      </CardTitle>
                      {board.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {board.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-card">
                <KanbanSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-base font-medium">No Boards Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first board to start managing tasks.</p>
                <Button size="sm" onClick={() => setIsBoardOpen(true)}>Create Board</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
