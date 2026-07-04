import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetBoard, 
  useListBoardLists,
  useCreateList,
  useCreateTask,
  useMoveTask,
  getGetBoardQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { BoardColumn } from "@/components/board/BoardColumn";
import { TaskCard } from "@/components/board/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus, Settings } from "lucide-react";
import { Task, TaskListWithTasks } from "@workspace/api-client-react";

export default function BoardDetail({ params }: { params: { boardId: string } }) {
  const boardId = parseInt(params.boardId);
  const queryClient = useQueryClient();
  
  const { data: board, isLoading: boardLoading } = useGetBoard(boardId, {
    query: { enabled: !!boardId, queryKey: getGetBoardQueryKey(boardId) }
  });
  
  // Local state for optimistic UI updates during drag
  const [lists, setLists] = useState<TaskListWithTasks[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync server data to local state
  React.useEffect(() => {
    if (board?.lists) {
      // Sort lists by position, and tasks inside by position
      const sortedLists = [...board.lists].sort((a, b) => a.position - b.position);
      const listsWithSortedTasks = sortedLists.map(list => ({
        ...list,
        tasks: [...(list.tasks || [])].sort((a, b) => a.position - b.position)
      }));
      setLists(listsWithSortedTasks);
    }
  }, [board]);

  const createList = useCreateList();
  const createTask = useCreateTask();
  const moveTask = useMoveTask();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddList = () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    
    createList.mutate(
      { 
        boardId,
        data: { name: newListTitle, position: lists.length } 
      },
      {
        onSuccess: () => {
          setNewListTitle("");
          setIsAddingList(false);
          queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
        }
      }
    );
  };

  const handleAddTask = (listId: number, title: string) => {
    if (!title.trim()) return;
    
    createTask.mutate(
      {
        listId,
        data: { title, priority: "MEDIUM" }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
        }
      }
    );
  };

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    
    if (data.current?.type === "Task") {
      setActiveTask(data.current.task as Task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Moving task over another task
    if (isActiveTask && isOverTask) {
      setLists((prev) => {
        const activeTasks = [...prev];
        
        const activeListIndex = activeTasks.findIndex(l => l.id === active.data.current?.task.listId);
        const overListIndex = activeTasks.findIndex(l => l.id === over.data.current?.task.listId);
        
        if (activeListIndex === -1 || overListIndex === -1) return prev;

        const activeTaskIndex = activeTasks[activeListIndex].tasks.findIndex(t => t.id === activeId);
        const overTaskIndex = activeTasks[overListIndex].tasks.findIndex(t => t.id === overId);

        if (activeListIndex === overListIndex) {
          // Same column
          activeTasks[activeListIndex].tasks = arrayMove(
            activeTasks[activeListIndex].tasks,
            activeTaskIndex,
            overTaskIndex
          );
        } else {
          // Different column
          const [removedTask] = activeTasks[activeListIndex].tasks.splice(activeTaskIndex, 1);
          removedTask.listId = activeTasks[overListIndex].id;
          activeTasks[overListIndex].tasks.splice(overTaskIndex, 0, removedTask);
        }
        
        // Re-assign positions locally for smooth UI
        activeTasks[activeListIndex].tasks.forEach((t, i) => t.position = i);
        if (activeListIndex !== overListIndex) {
          activeTasks[overListIndex].tasks.forEach((t, i) => t.position = i);
        }

        return activeTasks;
      });
    }
    
    // Moving task to an empty column
    if (isActiveTask && isOverColumn) {
      setLists((prev) => {
        const activeTasks = [...prev];
        const activeListIndex = activeTasks.findIndex(l => l.id === active.data.current?.task.listId);
        const overListIndex = activeTasks.findIndex(l => l.id === overId);
        
        if (activeListIndex === -1 || overListIndex === -1 || activeListIndex === overListIndex) return prev;

        const activeTaskIndex = activeTasks[activeListIndex].tasks.findIndex(t => t.id === activeId);
        const [removedTask] = activeTasks[activeListIndex].tasks.splice(activeTaskIndex, 1);
        
        removedTask.listId = activeTasks[overListIndex].id;
        activeTasks[overListIndex].tasks.push(removedTask);
        
        activeTasks[activeListIndex].tasks.forEach((t, i) => t.position = i);
        activeTasks[overListIndex].tasks.forEach((t, i) => t.position = i);

        return activeTasks;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    // After state is updated optimistically, tell the server
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    // Find the task's new list and position from our optimistic state
    let targetListId = -1;
    let targetPosition = -1;

    for (const list of lists) {
      const idx = list.tasks.findIndex(t => t.id === activeId);
      if (idx !== -1) {
        targetListId = list.id;
        targetPosition = idx;
        break;
      }
    }

    if (targetListId !== -1 && targetPosition !== -1) {
      moveTask.mutate(
        {
          taskId: activeId as number,
          data: { targetListId, position: targetPosition }
        },
        {
          // We don't necessarily need to invalidate on success if optimistic was right,
          // but good for ensuring sync.
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
          },
          onError: () => {
            // Revert on error
            queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
          }
        }
      );
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  if (boardLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="flex gap-4">
          <Skeleton className="h-[600px] w-80 shrink-0" />
          <Skeleton className="h-[600px] w-80 shrink-0" />
          <Skeleton className="h-[600px] w-80 shrink-0" />
        </div>
      </div>
    );
  }

  if (!board) return <div>Board not found</div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/project/${board.projectId}`} className="hover:text-foreground transition-colors">Project</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{board.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{board.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Board Settings
          </Button>
        </div>
      </div>

      {/* Kanban Board area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 select-none">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4 h-full">
            {lists.map((list) => (
              <BoardColumn 
                key={list.id} 
                list={list} 
                tasks={list.tasks || []} 
                onAddTask={(title) => handleAddTask(list.id, title)}
              />
            ))}

            {/* Add List Button */}
            <div className="w-80 shrink-0">
              {isAddingList ? (
                <div className="bg-card p-3 rounded-lg border border-border shadow-sm">
                  <Input
                    autoFocus
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') setIsAddingList(false);
                    }}
                    className="mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleAddList}>Add List</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingList(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingList(true)}
                  className="flex items-center gap-2 w-full p-3 rounded-lg bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-dashed border-border"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium text-sm">Add another list</span>
                </button>
              )}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
