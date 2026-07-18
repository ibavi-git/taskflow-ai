import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import { Edit3, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { ListDialog, TaskDialog } from "@/components/app/EntityDialogs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";



export function BoardColumn({ list, tasks, boardId, projectId, members = [], labels = [], onDeleteList, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: "Column", list },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex max-h-full w-80 shrink-0 flex-col rounded-lg border bg-sidebar/50 transition-colors ${isOver ? "border-primary" : "border-border"}`}
    >
      <div className="flex items-center justify-between border-b border-border/50 p-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold tracking-normal">{list.name}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="List actions">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <ListDialog
              boardId={boardId}
              list={list}
              trigger={<DropdownMenuItem onSelect={(event) => event.preventDefault()}><Edit3 className="h-4 w-4" />Edit list</DropdownMenuItem>}
            />
            <ConfirmAction title="Delete list?" description="This deletes the list and its tasks from the backend." onConfirm={() => onDeleteList(list.id)}>
              <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive"><Trash2 className="h-4 w-4" />Delete list</DropdownMenuItem>
            </ConfirmAction>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-h-[150px] flex-1 overflow-y-auto p-2">
        <div className="flex min-h-full flex-col gap-2">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                labels={labels}
                projectId={projectId}
                onDelete={() => onDeleteTask(task)}
              />
            ))}
          </SortableContext>

          <TaskDialog
            listId={list.id}
            members={members}
            labels={labels}
            projectId={projectId}
            trigger={
              <button className="group mt-1 flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Add task
            </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
