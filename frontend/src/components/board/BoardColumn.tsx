import React, { useState } from "react";
import { Task, TaskListWithTasks } from "@workspace/api-client-react";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BoardColumnProps {
  list: TaskListWithTasks;
  tasks: Task[];
  onAddTask: (title: string) => void;
}

export function BoardColumn({ list, tasks, onAddTask }: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "Column", list }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAdd = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
    }
    setNewTaskTitle("");
    setIsAdding(false);
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="w-80 shrink-0 max-h-full flex flex-col bg-sidebar/50 rounded-xl border border-border"
    >
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="p-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-border/50"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm tracking-wide">{list.name}</h3>
          <span className="flex items-center justify-center bg-accent text-muted-foreground text-xs font-medium h-5 min-w-[20px] px-1.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List */}
      <div className="p-2 flex-1 overflow-y-auto min-h-[150px] custom-scrollbar">
        <div className="flex flex-col gap-2 min-h-full">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>

          {/* Add Task Form inside column */}
          {isAdding ? (
            <div className="bg-card p-2 rounded-lg border border-primary/50 shadow-sm mt-1 animate-in fade-in zoom-in-95 duration-200">
              <Input
                autoFocus
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
                className="mb-2 h-8 text-sm"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-7 text-xs px-3" onClick={handleAdd}>Add</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-3" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 w-full p-2 mt-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-sm font-medium group"
            >
              <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Add task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
