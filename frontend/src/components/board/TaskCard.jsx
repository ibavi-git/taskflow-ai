import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Edit3, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { TaskDialog } from "@/components/app/EntityDialogs";
function TaskCard({ task, isOverlay = false, members = [], labels = [], projectId, onDelete }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "Task", task }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 100 : "auto"
  };
  const handleLinkClick = (e) => {
    if (isDragging) {
      e.preventDefault();
    }
  };
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  return <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
    className={`
        bg-card rounded-lg border border-border shadow-sm overflow-hidden group hover:border-primary/50 transition-colors relative
        ${isOverlay ? "shadow-xl scale-[1.02] rotate-2" : ""}
        ${isDragging ? "border-primary" : ""}
      `}
  >
      {!isOverlay ? <div className="absolute right-1.5 top-1.5 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 bg-card/90" aria-label="Task actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TaskDialog
    task={task}
    listId={task.listId}
    members={members}
    labels={labels}
    projectId={projectId}
    trigger={<DropdownMenuItem onSelect={(event) => event.preventDefault()}><Edit3 className="h-4 w-4" />Edit task</DropdownMenuItem>}
  />
              {onDelete ? <ConfirmAction title="Delete task?" description="This deletes the task through the backend API." onConfirm={onDelete}>
                  <DropdownMenuItem onSelect={(event) => event.preventDefault()} className="text-destructive"><Trash2 className="h-4 w-4" />Delete task</DropdownMenuItem>
                </ConfirmAction> : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> : null}
      <Link to={`/task/${task.id}`} onClick={handleLinkClick}>
        <div className="block cursor-grab p-3 pr-9 active:cursor-grabbing">
          
          {
    /* Labels */
  }
          {task.labels && task.labels.length > 0 && <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.map((label) => <div
    key={label.id}
    className="h-2 w-8 rounded-full"
    style={{ backgroundColor: label.color }}
    title={label.name}
  />)}
            </div>}

          <h4 className="font-medium text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
            {task.title}
          </h4>

          {
    /* Indicators Row */
  }
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {
    /* Priority */
  }
              {task.priority && <div className={`h-2 w-2 rounded-full ${task.priority === "URGENT" ? "bg-red-500" : task.priority === "HIGH" ? "bg-orange-500" : task.priority === "MEDIUM" ? "bg-blue-500" : "bg-gray-400"}`} title={`Priority: ${task.priority}`} />}
              
              {
    /* Date */
  }
              {task.dueDate && <div className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : isDueToday ? "text-orange-500 font-medium" : ""}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>}

              {
    /* Comments */
  }
              {(task.commentCount ?? 0) > 0 && <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.commentCount}</span>
                </div>}
            </div>

            {
    /* Assignee */
  }
            {task.assignee && <Avatar className="h-6 w-6 border border-background">
                <AvatarImage src={task.assignee.avatar || void 0} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>}
          </div>
        </div>
      </Link>
    </div>;
}
export {
  TaskCard
};
