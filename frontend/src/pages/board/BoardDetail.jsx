import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ChevronRight, Edit3, Plus, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { BoardColumn } from "@/components/board/BoardColumn";
import { TaskCard } from "@/components/board/TaskCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BoardDialog, ListDialog } from "@/components/app/EntityDialogs";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api";
import {
  getGetBoardQueryKey,
  useDeleteBoard,
  useDeleteList,
  useDeleteTask,
  useGetBoard,
  useGetProject,
  useListLabels,
  useListWorkspaceMembers,
  useMoveTask
} from "@workspace/api-client-react";
function BoardDetail({ params }) {
  const routeParams = useParams();
  const boardId = Number(params?.boardId ?? routeParams.boardId ?? "0");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: board, isLoading: boardLoading } = useGetBoard(boardId, { query: { enabled: Boolean(boardId) } });
  const { data: project } = useGetProject(board?.projectId ?? 0, { query: { enabled: Boolean(board?.projectId) } });
  const { data: members = [] } = useListWorkspaceMembers(project?.workspaceId ?? 0, { query: { enabled: Boolean(project?.workspaceId) } });
  const { data: labels = [] } = useListLabels(project?.workspaceId ?? 0, { query: { enabled: Boolean(project?.workspaceId) } });
  const [lists, setLists] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const moveTask = useMoveTask();
  const deleteList = useDeleteList();
  const deleteTask = useDeleteTask();
  const deleteBoard = useDeleteBoard();
  useEffect(() => {
    if (board?.lists) {
      setLists(
        [...board.lists].sort((a, b) => a.position - b.position).map((list) => ({ ...list, tasks: [...list.tasks || []].sort((a, b) => a.position - b.position) }))
      );
    }
  }, [board]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const activeLocation = useMemo(() => {
    if (!activeTask) return null;
    for (const list of lists) {
      const index = list.tasks.findIndex((task) => task.id === activeTask.id);
      if (index >= 0) return { listId: list.id, position: index };
    }
    return null;
  }, [activeTask, lists]);
  const handleDragStart = (event) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || active.data.current?.type !== "Task") return;
    setLists((current) => {
      const next = current.map((list) => ({ ...list, tasks: [...list.tasks] }));
      const fromListIndex = next.findIndex((list) => list.tasks.some((task) => task.id === active.id));
      const toListIndex = next.findIndex((list) => list.id === over.id || list.tasks.some((task) => task.id === over.id));
      if (fromListIndex < 0 || toListIndex < 0) return current;
      const fromTaskIndex = next[fromListIndex].tasks.findIndex((task) => task.id === active.id);
      const overTaskIndex = next[toListIndex].tasks.findIndex((task) => task.id === over.id);
      const [moving] = next[fromListIndex].tasks.splice(fromTaskIndex, 1);
      const insertAt = overTaskIndex >= 0 ? overTaskIndex : next[toListIndex].tasks.length;
      next[toListIndex].tasks.splice(insertAt, 0, { ...moving, listId: next[toListIndex].id });
      return next.map((list) => ({ ...list, tasks: list.tasks.map((task, position) => ({ ...task, position })) }));
    });
  };
  const handleDragEnd = (event) => {
    const movingTask = activeTask;
    setActiveTask(null);
    if (!movingTask || !event.over || !activeLocation) return;
    moveTask.mutate(
      { taskId: movingTask.id, data: { targetListId: activeLocation.listId, position: activeLocation.position } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) }),
        onError: (error) => {
          toast({ title: "Move failed", description: getApiErrorMessage(error), variant: "destructive" });
          queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
        }
      }
    );
  };
  const handleDeleteList = (listId) => {
    deleteList.mutate(
      { listId, boardId },
      {
        onSuccess: () => toast({ title: "List deleted" }),
        onError: (error) => toast({ title: "Delete failed", description: getApiErrorMessage(error), variant: "destructive" })
      }
    );
  };
  const handleDeleteTask = (task) => {
    deleteTask.mutate(
      { taskId: task.id, listId: task.listId, boardId },
      {
        onSuccess: () => toast({ title: "Task deleted" }),
        onError: (error) => toast({ title: "Delete failed", description: getApiErrorMessage(error), variant: "destructive" })
      }
    );
  };
  if (boardLoading) {
    return <div className="space-y-4">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-[600px] w-80 shrink-0" />
          <Skeleton className="h-[600px] w-80 shrink-0" />
          <Skeleton className="h-[600px] w-80 shrink-0" />
        </div>
      </div>;
  }
  if (!board) return <div>Board not found</div>;
  return <div className="-mx-4 flex h-[calc(100vh-140px)] flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mb-6 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/projects" className="transition-colors hover:text-foreground">Workspaces</Link>
            <ChevronRight className="h-3 w-3" />
            {project ? <Link to={`/workspace/${project.workspaceId}`} className="transition-colors hover:text-foreground">Workspace</Link> : null}
            <ChevronRight className="h-3 w-3" />
            <Link to={`/project/${board.projectId}`} className="transition-colors hover:text-foreground">Project</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{board.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-normal">{board.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{board.description || "Drag tasks between lists to update their backend position."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <BoardDialog projectId={board.projectId} board={board} trigger={<Button variant="outline" size="sm"><Edit3 className="mr-2 h-4 w-4" />Edit board</Button>} />
          <ConfirmAction
    title="Delete board?"
    description="This deletes this board and all of its lists/tasks."
    onConfirm={() => deleteBoard.mutate({ boardId, projectId: board.projectId })}
  >
            <Button variant="destructive" size="sm"><Settings className="mr-2 h-4 w-4" />Delete board</Button>
          </ConfirmAction>
        </div>
      </div>

      <div className="flex-1 select-none overflow-x-auto overflow-y-hidden pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex h-full items-start gap-4">
            {lists.map((list) => <BoardColumn
    key={list.id}
    list={list}
    tasks={list.tasks || []}
    boardId={boardId}
    projectId={board.projectId}
    members={members}
    labels={labels}
    onDeleteList={handleDeleteList}
    onDeleteTask={handleDeleteTask}
  />)}

            <div className="w-80 shrink-0">
              <ListDialog
    boardId={boardId}
    nextPosition={lists.length}
    trigger={<button className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border bg-accent/40 p-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    <Plus className="h-4 w-4" />
                    Add another list
                  </button>}
  />
            </div>
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>;
}
export {
  BoardDetail as default
};
