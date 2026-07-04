import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

// --- Types ---

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt?: string | null;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  ownerId: number;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: string;
  user?: User;
  joinedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  color?: string | null;
  status: string;
  workspaceId: number;
  boardCount?: number;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
}

export interface Board {
  id: number;
  name: string;
  description?: string | null;
  projectId: number;
  createdAt: string;
}

export interface TaskList {
  id: number;
  name: string;
  boardId: number;
  position: number;
  taskCount?: number;
  createdAt: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  workspaceId: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "TESTING" | "DONE" | string;
  listId: number;
  position: number;
  dueDate?: string | null;
  estimatedHours?: number | null;
  spentHours?: number | null;
  assignee?: User | null;
  labels: Label[];
  commentCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListWithTasks {
  id: number;
  name: string;
  boardId: number;
  position: number;
  tasks: Task[];
  createdAt: string;
}

export interface BoardDetail {
  id: number;
  name: string;
  description?: string | null;
  projectId: number;
  lists: TaskListWithTasks[];
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  taskId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends Task {
  comments?: Comment[];
  checklist?: { id: number; text: string; completed: boolean }[];
  calendarEventId?: string | null;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  taskId?: number | null;
  googleEventId?: string | null;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  taskId?: number | null;
  createdAt: string;
}

export interface TaskStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdue: number;
  completedToday: number;
}

export interface ProjectProgress {
  projectId: number;
  projectName: string;
  total: number;
  completed: number;
  percentage: number;
  status: string;
}

export interface ProductivityEntry {
  label: string;
  completed: number;
  created: number;
}

export interface SearchResults {
  tasks: Task[];
  projects: Project[];
  users: User[];
}

export interface AiResponse {
  result: string;
  type: string;
  tokenUsage?: number;
}

export interface AiHistory {
  id: number;
  type: string;
  prompt: string;
  result: string;
  createdAt: string;
}

// --- Query Keys ---

export const getListWorkspacesQueryKey = () => ["workspaces"];
export const getGetWorkspaceQueryKey = (id: number) => ["workspace", id];
export const getListWorkspaceMembersQueryKey = (workspaceId: number) => ["members", workspaceId];
export const getListProjectsQueryKey = (workspaceId: number) => ["projects", workspaceId];
export const getGetProjectQueryKey = (id: number) => ["project", id];
export const getListBoardsQueryKey = (projectId: number) => ["boards", projectId];
export const getGetBoardQueryKey = (id: number) => ["board", id];
export const getListBoardListsQueryKey = (boardId: number) => ["lists", boardId];
export const getGetTaskQueryKey = (id: number) => ["task", id];
export const getListCommentsQueryKey = (taskId: number) => ["comments", taskId];
export const getListNotificationsQueryKey = () => ["notifications"];
export const getListCalendarEventsQueryKey = () => ["calendar-events"];
export const getListLabelsQueryKey = (workspaceId: number) => ["labels", workspaceId];
export const getReportsTaskStatsQueryKey = (workspaceId?: number) => ["reports-task-stats", workspaceId];
export const getReportsProjectProgressQueryKey = (workspaceId?: number) => ["reports-project-progress", workspaceId];
export const getReportsProductivityQueryKey = (workspaceId?: number, period?: string) => ["reports-productivity", workspaceId, period];
export const getAiHistoryQueryKey = () => ["ai-history"];
export const getSearchQueryKey = (q: string) => ["search", q];

// --- Hooks ---

// Workspaces
export function useListWorkspaces(options?: any) {
  return useQuery<Workspace[]>({
    queryKey: getListWorkspacesQueryKey(),
    queryFn: async () => {
      const { data } = await api.get<Workspace[]>("/workspaces");
      return data;
    },
    ...options?.query,
  });
}

export function useGetWorkspace(workspaceId: number, options?: any) {
  return useQuery<Workspace>({
    queryKey: getGetWorkspaceQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<Workspace>(`/workspaces/${workspaceId}`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, any, { name: string; description?: string; color?: string }>({
    mutationFn: async (variables) => {
      const { data } = await api.post<Workspace>("/workspaces", variables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<Workspace, any, { workspaceId: number; data: { name?: string; description?: string; color?: string } }>({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.put<Workspace>(`/workspaces/${workspaceId}`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetWorkspaceQueryKey(workspaceId) });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { workspaceId: number }>({
    mutationFn: async ({ workspaceId }) => {
      await api.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
    },
  });
}

// Workspace Members
export function useListWorkspaceMembers(workspaceId: number, options?: any) {
  return useQuery<WorkspaceMember[]>({
    queryKey: getListWorkspaceMembersQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
      return data;
    },
    ...options?.query,
  });
}

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceMember, any, { workspaceId: number; data: { email: string; role: string } }>({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { workspaceId: number; userId: number }>({
    mutationFn: async ({ workspaceId, userId }) => {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
    },
  });
}

// Projects
export function useListProjects(workspaceId: number, options?: any) {
  return useQuery<Project[]>({
    queryKey: getListProjectsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<Project[]>(`/workspaces/${workspaceId}/projects`);
      return data;
    },
    ...options?.query,
  });
}

export function useGetProject(projectId: number, options?: any) {
  return useQuery<Project>({
    queryKey: getGetProjectQueryKey(projectId),
    queryFn: async () => {
      const { data } = await api.get<Project>(`/projects/${projectId}`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, any, { workspaceId: number; data: { name: string; description?: string; color?: string } }>({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.post<Project>(`/workspaces/${workspaceId}/projects`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(workspaceId) });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation<Project, any, { projectId: number; data: { name?: string; description?: string; color?: string; status?: string } }>({
    mutationFn: async ({ projectId, data }) => {
      const { data: res } = await api.put<Project>(`/projects/${projectId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(res.workspaceId) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { projectId: number; workspaceId: number }>({
    mutationFn: async ({ projectId }) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(workspaceId) });
    },
  });
}

// Boards
export function useListBoards(projectId: number, options?: any) {
  return useQuery<Board[]>({
    queryKey: getListBoardsQueryKey(projectId),
    queryFn: async () => {
      const { data } = await api.get<Board[]>(`/projects/${projectId}/boards`);
      return data;
    },
    ...options?.query,
  });
}

export function useGetBoard(boardId: number, options?: any) {
  return useQuery<BoardDetail>({
    queryKey: getGetBoardQueryKey(boardId),
    queryFn: async () => {
      const { data } = await api.get<BoardDetail>(`/boards/${boardId}`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation<Board, any, { projectId: number; data: { name: string; description?: string } }>({
    mutationFn: async ({ projectId, data }) => {
      const { data: res } = await api.post<Board>(`/projects/${projectId}/boards`, data);
      return res;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(projectId) });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation<Board, any, { boardId: number; data: { name?: string; description?: string } }>({
    mutationFn: async ({ boardId, data }) => {
      const { data: res } = await api.put<Board>(`/boards/${boardId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(res.projectId) });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { boardId: number; projectId: number }>({
    mutationFn: async ({ boardId }) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(projectId) });
    },
  });
}

// Task Lists
export function useListBoardLists(boardId: number, options?: any) {
  return useQuery<TaskList[]>({
    queryKey: getListBoardListsQueryKey(boardId),
    queryFn: async () => {
      const { data } = await api.get<TaskList[]>(`/boards/${boardId}/lists`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation<TaskList, any, { boardId: number; data: { name: string; position: number } }>({
    mutationFn: async ({ boardId, data }) => {
      const { data: res } = await api.post<TaskList>(`/boards/${boardId}/lists`, data);
      return res;
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation<TaskList, any, { listId: number; boardId: number; data: { name?: string; position?: number } }>({
    mutationFn: async ({ listId, data }) => {
      const { data: res } = await api.put<TaskList>(`/lists/${listId}`, data);
      return res;
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { listId: number; boardId: number }>({
    mutationFn: async ({ listId }) => {
      await api.delete(`/lists/${listId}`);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    },
  });
}

// Tasks
export function useListTasks(listId: number, options?: any) {
  return useQuery<Task[]>({
    queryKey: ["tasks", listId],
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/lists/${listId}/tasks`);
      return data;
    },
    ...options?.query,
  });
}

export function useGetTask(taskId: number, options?: any) {
  return useQuery<TaskDetail>({
    queryKey: getGetTaskQueryKey(taskId),
    queryFn: async () => {
      const { data } = await api.get<TaskDetail>(`/tasks/${taskId}`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, any, { listId: number; data: { title: string; description?: string; priority?: string; dueDate?: string; assigneeId?: number | null; estimatedHours?: number } }>({
    mutationFn: async ({ listId, data }) => {
      const { data: res } = await api.post<Task>(`/lists/${listId}/tasks`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      // Invalidate board detail since lists count tasks
      api.get<TaskList>(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {});
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, any, { taskId: number; data: { title?: string; description?: string; priority?: string; status?: string; dueDate?: string; assigneeId?: number | null; estimatedHours?: number; spentHours?: number } }>({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.put<Task>(`/tasks/${taskId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      api.get<TaskList>(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {});
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { taskId: number; listId: number; boardId: number }>({
    mutationFn: async ({ taskId }) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: (_, { listId, boardId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation<Task, any, { taskId: number; data: { targetListId: number; position: number } }>({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.patch<Task>(`/tasks/${taskId}/move`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      api.get<TaskList>(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {});
    },
  });
}

export function useAddLabelToTask() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { taskId: number; labelId: number }>({
    mutationFn: async ({ taskId, labelId }) => {
      await api.post(`/tasks/${taskId}/labels/${labelId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    },
  });
}

export function useRemoveLabelFromTask() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { taskId: number; labelId: number }>({
    mutationFn: async ({ taskId, labelId }) => {
      await api.delete(`/tasks/${taskId}/labels/${labelId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    },
  });
}

// Labels
export function useListLabels(workspaceId: number, options?: any) {
  return useQuery<Label[]>({
    queryKey: getListLabelsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<Label[]>(`/workspaces/${workspaceId}/labels`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation<Label, any, { workspaceId: number; name: string; color: string }>({
    mutationFn: async ({ workspaceId, name, color }) => {
      const { data } = await api.post<Label>(`/workspaces/${workspaceId}/labels`, { name, color });
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    },
  });
}

export function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation<Label, any, { labelId: number; workspaceId: number; name: string; color: string }>({
    mutationFn: async ({ labelId, name, color }) => {
      const { data } = await api.put<Label>(`/labels/${labelId}`, { name, color });
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    },
  });
}

export function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { labelId: number; workspaceId: number }>({
    mutationFn: async ({ labelId }) => {
      await api.delete(`/labels/${labelId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    },
  });
}

// Comments
export function useListComments(taskId: number, options?: any) {
  return useQuery<Comment[]>({
    queryKey: getListCommentsQueryKey(taskId),
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
      return data;
    },
    ...options?.query,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation<Comment, any, { taskId: number; data: { content: string } }>({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.post<Comment>(`/tasks/${taskId}/comments`, data);
      return res;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation<Comment, any, { commentId: number; taskId: number; data: { content: string } }>({
    mutationFn: async ({ commentId, data }) => {
      const { data: res } = await api.put<Comment>(`/comments/${commentId}`, data);
      return res;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { commentId: number; taskId: number }>({
    mutationFn: async ({ commentId }) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    },
  });
}

// Notifications
export function useListNotifications(options?: any) {
  return useQuery<Notification[]>({
    queryKey: getListNotificationsQueryKey(),
    queryFn: async () => {
      const { data } = await api.get<Notification[]>("/notifications");
      return data;
    },
    ...options?.query,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation<void, any, void>({
    mutationFn: async () => {
      await api.patch("/notifications");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation<Notification, any, { notificationId: number }>({
    mutationFn: async ({ notificationId }) => {
      const { data } = await api.patch<Notification>(`/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { notificationId: number }>({
    mutationFn: async ({ notificationId }) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    },
  });
}

// Calendar Events
export function useListCalendarEvents(options?: any) {
  return useQuery<CalendarEvent[]>({
    queryKey: getListCalendarEventsQueryKey(),
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent[]>("/calendar/events");
      return data;
    },
    ...options?.query,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation<CalendarEvent, any, { title: string; description?: string; startDate: string; endDate: string; taskId?: number }>({
    mutationFn: async (variables) => {
      const { data } = await api.post<CalendarEvent>("/calendar/events", variables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation<CalendarEvent, any, { eventId: number; data: { title?: string; description?: string; startDate?: string; endDate?: string } }>({
    mutationFn: async ({ eventId, data }) => {
      const { data: res } = await api.put<CalendarEvent>(`/calendar/events/${eventId}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation<void, any, { eventId: number }>({
    mutationFn: async ({ eventId }) => {
      await api.delete(`/calendar/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    },
  });
}

export function useSyncTaskToCalendar() {
  const queryClient = useQueryClient();
  return useMutation<CalendarEvent, any, { taskId: number }>({
    mutationFn: async ({ taskId }) => {
      const { data } = await api.post<CalendarEvent>(`/tasks/${taskId}/sync-calendar`);
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    },
  });
}

// Reports
export function useGetTaskStats(workspaceId?: number, options?: any) {
  return useQuery<TaskStats>({
    queryKey: getReportsTaskStatsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<TaskStats>("/reports/task-stats", {
        params: workspaceId ? { workspaceId } : {},
      });
      return data;
    },
    ...options?.query,
  });
}

export function useGetProjectProgress(workspaceId?: number, options?: any) {
  return useQuery<ProjectProgress[]>({
    queryKey: getReportsProjectProgressQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get<ProjectProgress[]>("/reports/project-progress", {
        params: workspaceId ? { workspaceId } : {},
      });
      return data;
    },
    ...options?.query,
  });
}

export function useGetProductivity(workspaceId?: number, period: string = "weekly", options?: any) {
  return useQuery<ProductivityEntry[]>({
    queryKey: getReportsProductivityQueryKey(workspaceId, period),
    queryFn: async () => {
      const { data } = await api.get<ProductivityEntry[]>("/reports/productivity", {
        params: {
          period,
          ...(workspaceId ? { workspaceId } : {}),
        },
      });
      return data;
    },
    ...options?.query,
  });
}

// Global Search
export function useGlobalSearch(q: string, options?: any) {
  return useQuery<SearchResults>({
    queryKey: [getSearchQueryKey(q)],
    queryFn: async () => {
      const { data } = await api.get<SearchResults>("/search", {
        params: { q },
      });
      return data;
    },
    enabled: typeof q === "string" && q.trim().length > 0,
    ...options?.query,
  });
}

// AI Actions
export function useGenerateTaskDescription() {
  return useMutation<AiResponse, any, { data: { prompt: string; taskId?: number; projectId?: number } }>({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post<AiResponse>("/ai/generate-description", data);
      return res;
    },
  });
}

export function useGenerateSubtasks() {
  return useMutation<AiResponse, any, { data: { prompt: string; taskId?: number; projectId?: number } }>({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post<AiResponse>("/ai/generate-subtasks", data);
      return res;
    },
  });
}

export function useSuggestPriority() {
  return useMutation<AiResponse, any, { data: { prompt: string; taskId?: number; projectId?: number } }>({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post<AiResponse>("/ai/suggest-priority", data);
      return res;
    },
  });
}

export function useDailySummary() {
  return useMutation<AiResponse, any, { data: { prompt: string; taskId?: number; projectId?: number } }>({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post<AiResponse>("/ai/daily-summary", data);
      return res;
    },
  });
}

export function useProjectHealth() {
  return useMutation<AiResponse, any, { data: { prompt: string; taskId?: number; projectId?: number } }>({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post<AiResponse>("/ai/project-health", data);
      return res;
    },
  });
}

export function useGetAiHistory(options?: any) {
  return useQuery<AiHistory[]>({
    queryKey: getAiHistoryQueryKey(),
    queryFn: async () => {
      const { data } = await api.get<AiHistory[]>("/ai/history");
      return data;
    },
    ...options?.query,
  });
}

// Profile
export function useUpdateProfile() {
  return useMutation<User, any, { name?: string; avatar?: string; bio?: string }>({
    mutationFn: async (variables) => {
      const { data } = await api.put<User>("/auth/profile", variables);
      return data;
    },
  });
}
