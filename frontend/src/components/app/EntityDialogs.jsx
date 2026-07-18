import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/services/api";
import {
  useAddLabelToTask,
  useCreateBoard,
  useCreateLabel,
  useCreateList,
  useCreateProject,
  useCreateTask,
  useCreateWorkspace,
  useGenerateTaskDescription,
  useRemoveLabelFromTask,
  useUpdateBoard,
  useUpdateLabel,
  useUpdateList,
  useUpdateProject,
  useUpdateTask,
  useUpdateWorkspace
} from "@workspace/api-client-react";
const colors = ["#7c3aed", "#0891b2", "#16a34a", "#f59e0b", "#ef4444", "#db2777"];
const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses = ["BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "DONE"];
const projectStatuses = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"];
function DialogShell({ trigger, title, description, open, onOpenChange, children }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>;
}
function Field({ label, children }) {
  return <label className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>;
}
function WorkspaceDialog({ trigger, workspace }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(workspace?.name ?? "");
  const [description, setDescription] = useState(workspace?.description ?? "");
  const [color, setColor] = useState(workspace?.color ?? colors[0]);
  const createWorkspace = useCreateWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setName(workspace?.name ?? "");
      setDescription(workspace?.description ?? "");
      setColor(workspace?.color ?? colors[0]);
    }
  }, [open, workspace]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (workspace) {
        await updateWorkspace.mutateAsync({ workspaceId: workspace.id, data: { name, description, color } });
      } else {
        await createWorkspace.mutateAsync({ name, description, color });
      }
      toast({ title: workspace ? "Workspace updated" : "Workspace created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "Workspace save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <DialogShell
    trigger={trigger}
    title={workspace ? "Edit workspace" : "Create workspace"}
    description="Workspace details are saved directly to the backend."
    open={open}
    onOpenChange={setOpen}
  >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {colors.map((option) => <button
    key={option}
    type="button"
    aria-label={`Use ${option}`}
    onClick={() => setColor(option)}
    className={`h-8 w-8 rounded-md border ${color === option ? "border-foreground" : "border-border"}`}
    style={{ backgroundColor: option }}
  />)}
            <Input className="h-8 w-32" value={color} onChange={(event) => setColor(event.target.value)} />
          </div>
        </Field>
        <DialogFooter>
          <Button type="submit" disabled={!name.trim() || createWorkspace.isPending || updateWorkspace.isPending}>
            {workspace ? "Save changes" : "Create workspace"}
          </Button>
        </DialogFooter>
      </form>
    </DialogShell>;
}
function ProjectDialog({ trigger, workspaceId, project }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [color, setColor] = useState(project?.color ?? colors[1]);
  const [status, setStatus] = useState(project?.status ?? "ACTIVE");
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setName(project?.name ?? "");
      setDescription(project?.description ?? "");
      setColor(project?.color ?? colors[1]);
      setStatus(project?.status ?? "ACTIVE");
    }
  }, [open, project]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (project) {
        await updateProject.mutateAsync({ projectId: project.id, data: { name, description, color, status } });
      } else {
        await createProject.mutateAsync({ workspaceId, data: { name, description, color } });
      }
      toast({ title: project ? "Project updated" : "Project created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "Project save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <DialogShell trigger={trigger} title={project ? "Edit project" : "Create project"} description="Projects live inside a workspace." open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name">
          <Input value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{projectStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Color">
          <Input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </Field>
        <DialogFooter>
          <Button type="submit" disabled={!name.trim() || createProject.isPending || updateProject.isPending}>Save project</Button>
        </DialogFooter>
      </form>
    </DialogShell>;
}
function BoardDialog({ trigger, projectId, board }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(board?.name ?? "");
  const [description, setDescription] = useState(board?.description ?? "");
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setName(board?.name ?? "");
      setDescription(board?.description ?? "");
    }
  }, [board, open]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (board) {
        await updateBoard.mutateAsync({ boardId: board.id, data: { name, description } });
      } else {
        await createBoard.mutateAsync({ projectId, data: { name, description } });
      }
      toast({ title: board ? "Board updated" : "Board created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "Board save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <DialogShell trigger={trigger} title={board ? "Edit board" : "Create board"} description="Boards contain lists and tasks." open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
        <DialogFooter><Button type="submit" disabled={!name.trim() || createBoard.isPending || updateBoard.isPending}>Save board</Button></DialogFooter>
      </form>
    </DialogShell>;
}
function ListDialog({ trigger, boardId, list, nextPosition = 0 }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(list?.name ?? "");
  const [position, setPosition] = useState(String(list?.position ?? nextPosition));
  const createList = useCreateList();
  const updateList = useUpdateList();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setName(list?.name ?? "");
      setPosition(String(list?.position ?? nextPosition));
    }
  }, [list, nextPosition, open]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsedPosition = Number.parseInt(position || "0", 10);
    try {
      if (list) {
        await updateList.mutateAsync({ listId: list.id, boardId, data: { name, position: parsedPosition } });
      } else {
        await createList.mutateAsync({ boardId, data: { name, position: parsedPosition } });
      }
      toast({ title: list ? "List updated" : "List created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "List save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <DialogShell trigger={trigger} title={list ? "Edit list" : "Create list"} description="Lists define columns on the Kanban board." open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Position"><Input type="number" min={0} value={position} onChange={(event) => setPosition(event.target.value)} /></Field>
        <DialogFooter><Button type="submit" disabled={!name.trim() || createList.isPending || updateList.isPending}>Save list</Button></DialogFooter>
      </form>
    </DialogShell>;
}
function LabelDialog({ trigger, workspaceId, label }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(label?.name ?? "");
  const [color, setColor] = useState(label?.color ?? colors[2]);
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setName(label?.name ?? "");
      setColor(label?.color ?? colors[2]);
    }
  }, [label, open]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (label) {
        await updateLabel.mutateAsync({ labelId: label.id, workspaceId, name, color });
      } else {
        await createLabel.mutateAsync({ workspaceId, name, color });
      }
      toast({ title: label ? "Label updated" : "Label created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "Label save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <DialogShell trigger={trigger} title={label ? "Edit label" : "Create label"} description="Labels are available to tasks in this workspace." open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
        <Field label="Color"><Input type="color" value={color} onChange={(event) => setColor(event.target.value)} /></Field>
        <DialogFooter><Button type="submit" disabled={!name.trim() || createLabel.isPending || updateLabel.isPending}>Save label</Button></DialogFooter>
      </form>
    </DialogShell>;
}
function TaskDialog({ trigger, listId, task, members = [], labels = [], projectId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM");
  const [status, setStatus] = useState(task?.status ?? "TODO");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assignee?.id ? String(task.assignee.id) : "unassigned");
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours ? String(task.estimatedHours) : "");
  const [spentHours, setSpentHours] = useState(task?.spentHours ? String(task.spentHours) : "");
  const [selectedLabels, setSelectedLabels] = useState(() => task?.labels?.map((label) => label.id) ?? []);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const generateDescription = useGenerateTaskDescription();
  const addLabel = useAddLabelToTask();
  const removeLabel = useRemoveLabelFromTask();
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setPriority(task?.priority ?? "MEDIUM");
      setStatus(task?.status ?? "TODO");
      setDueDate(task?.dueDate ?? "");
      setAssigneeId(task?.assignee?.id ? String(task.assignee.id) : "unassigned");
      setEstimatedHours(task?.estimatedHours ? String(task.estimatedHours) : "");
      setSpentHours(task?.spentHours ? String(task.spentHours) : "");
      setSelectedLabels(task?.labels?.map((label) => label.id) ?? []);
    }
  }, [open, task]);
  const memberOptions = useMemo(() => members.filter((member) => member.user), [members]);
  const syncLabels = async (taskId, previous) => {
    const toAdd = selectedLabels.filter((labelId) => !previous.includes(labelId));
    const toRemove = previous.filter((labelId) => !selectedLabels.includes(labelId));
    await Promise.all([
      ...toAdd.map((labelId) => addLabel.mutateAsync({ taskId, labelId })),
      ...toRemove.map((labelId) => removeLabel.mutateAsync({ taskId, labelId }))
    ]);
  };
  const handleGenerateDescription = async () => {
    const prompt = `Task Title:${title} Project:TaskFlow AI Generate a professional software development task description.`;
    try {
      const response = await generateDescription.mutateAsync({ data: { prompt, taskId: task?.id, projectId } });
      setDescription(response.result);
      toast({ title: "Description generated" });
    } catch (error) {
      toast({ title: "AI generation failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title,
      description,
      priority,
      status,
      dueDate: dueDate || void 0,
      assigneeId: assigneeId === "unassigned" ? null : Number(assigneeId),
      estimatedHours: estimatedHours ? Number(estimatedHours) : void 0,
      spentHours: spentHours ? Number(spentHours) : void 0
    };
    try {
      if (task) {
        const updated = await updateTask.mutateAsync({ taskId: task.id, data: payload });
        await syncLabels(updated.id, task.labels?.map((label) => label.id) ?? []);
      } else {
        const created = await createTask.mutateAsync({ listId, data: payload });
        await syncLabels(created.id, []);
      }
      toast({ title: task ? "Task updated" : "Task created" });
      setOpen(false);
    } catch (error) {
      toast({ title: "Task save failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  const toggleLabel = (labelId) => {
    setSelectedLabels((current) => current.includes(labelId) ? current.filter((id) => id !== labelId) : [...current, labelId]);
  };
  return <DialogShell trigger={trigger} title={task ? "Edit task" : "Create task"} description="Tasks are persisted to the selected backend list." open={open} onOpenChange={setOpen}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Title"><Input value={title} onChange={(event) => setTitle(event.target.value)} required /></Field>
        <Field label="Description">
          <div className="space-y-2">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28" />
            <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generateDescription.isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              {generateDescription.isPending ? "Generating..." : "Generate with Grok"}
            </Button>
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Priority">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Due date"><Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></Field>
          <Field label="Assignee">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {memberOptions.map((member) => <SelectItem key={member.userId} value={String(member.userId)}>{member.user?.name ?? member.user?.email}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Estimated hours"><Input type="number" min={0} step="0.25" value={estimatedHours} onChange={(event) => setEstimatedHours(event.target.value)} /></Field>
          <Field label="Spent hours"><Input type="number" min={0} step="0.25" value={spentHours} onChange={(event) => setSpentHours(event.target.value)} /></Field>
        </div>
        {labels.length ? <div className="space-y-2">
            <p className="text-sm font-medium">Labels</p>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => <button
    key={label.id}
    type="button"
    onClick={() => toggleLabel(label.id)}
    className={`rounded-md border px-2.5 py-1 text-xs transition ${selectedLabels.includes(label.id) ? "border-foreground bg-accent" : "border-border"}`}
  >
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: label.color }} />
                  {label.name}
                </button>)}
            </div>
          </div> : null}
        <DialogFooter>
          <Button type="submit" disabled={!title.trim() || createTask.isPending || updateTask.isPending}>Save task</Button>
        </DialogFooter>
      </form>
    </DialogShell>;
}
export {
  BoardDialog,
  LabelDialog,
  ListDialog,
  ProjectDialog,
  TaskDialog,
  WorkspaceDialog
};
