import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
const getListWorkspacesQueryKey = () => ["workspaces"];
const getGetWorkspaceQueryKey = (id) => ["workspace", id];
const getListWorkspaceMembersQueryKey = (workspaceId) => ["members", workspaceId];
const getListProjectsQueryKey = (workspaceId) => ["projects", workspaceId];
const getGetProjectQueryKey = (id) => ["project", id];
const getListBoardsQueryKey = (projectId) => ["boards", projectId];
const getGetBoardQueryKey = (id) => ["board", id];
const getListBoardListsQueryKey = (boardId) => ["lists", boardId];
const getGetTaskQueryKey = (id) => ["task", id];
const getListCommentsQueryKey = (taskId) => ["comments", taskId];
const getListNotificationsQueryKey = () => ["notifications"];
const getListCalendarEventsQueryKey = () => ["calendar-events"];
const getListLabelsQueryKey = (workspaceId) => ["labels", workspaceId];
const getDashboardStatsQueryKey = () => ["dashboard-stats"];
const getDashboardActivityQueryKey = () => ["dashboard-activity"];
const getDashboardUpcomingQueryKey = () => ["dashboard-upcoming"];
const getReportsTaskStatsQueryKey = (workspaceId) => ["reports-task-stats", workspaceId];
const getReportsProjectProgressQueryKey = (workspaceId) => ["reports-project-progress", workspaceId];
const getReportsProductivityQueryKey = (workspaceId, period) => ["reports-productivity", workspaceId, period];
const getAiHistoryQueryKey = () => ["ai-history"];
const getSearchQueryKey = (q) => ["search", q];
const getTaskSearchQueryKey = (filters) => ["tasks-search", filters];
function useListWorkspaces(options) {
  return useQuery({
    queryKey: getListWorkspacesQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/workspaces");
      return data;
    },
    ...options?.query
  });
}
function useGetWorkspace(workspaceId, options) {
  return useQuery({
    queryKey: getGetWorkspaceQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}`);
      return data;
    },
    ...options?.query
  });
}
function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables) => {
      const { data } = await api.post("/workspaces", variables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
    }
  });
}
function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.put(`/workspaces/${workspaceId}`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetWorkspaceQueryKey(workspaceId) });
    }
  });
}
function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId }) => {
      await api.delete(`/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListWorkspacesQueryKey() });
    }
  });
}
function useListWorkspaceMembers(workspaceId, options) {
  return useQuery({
    queryKey: getListWorkspaceMembersQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/members`);
      return data;
    },
    ...options?.query
  });
}
function useAddWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.post(`/workspaces/${workspaceId}/members`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
    }
  });
}
function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, userId }) => {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
    }
  });
}
function useListProjects(workspaceId, options) {
  return useQuery({
    queryKey: getListProjectsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
      return data;
    },
    ...options?.query
  });
}
function useGetProject(projectId, options) {
  return useQuery({
    queryKey: getGetProjectQueryKey(projectId),
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}`);
      return data;
    },
    ...options?.query
  });
}
function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, data }) => {
      const { data: res } = await api.post(`/workspaces/${workspaceId}/projects`, data);
      return res;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(workspaceId) });
    }
  });
}
function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const { data: res } = await api.put(`/projects/${projectId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(res.workspaceId) });
    }
  });
}
function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId }) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(workspaceId) });
    }
  });
}
function useListBoards(projectId, options) {
  return useQuery({
    queryKey: getListBoardsQueryKey(projectId),
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/boards`);
      return data;
    },
    ...options?.query
  });
}
function useGetBoard(boardId, options) {
  return useQuery({
    queryKey: getGetBoardQueryKey(boardId),
    queryFn: async () => {
      const { data } = await api.get(`/boards/${boardId}`);
      return data;
    },
    ...options?.query
  });
}
function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const { data: res } = await api.post(`/projects/${projectId}/boards`, data);
      return res;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(projectId) });
    }
  });
}
function useUpdateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId, data }) => {
      const { data: res } = await api.put(`/boards/${boardId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(res.projectId) });
    }
  });
}
function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId }) => {
      await api.delete(`/boards/${boardId}`);
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: getListBoardsQueryKey(projectId) });
    }
  });
}
function useListBoardLists(boardId, options) {
  return useQuery({
    queryKey: getListBoardListsQueryKey(boardId),
    queryFn: async () => {
      const { data } = await api.get(`/boards/${boardId}/lists`);
      return data;
    },
    ...options?.query
  });
}
function useCreateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId, data }) => {
      const { data: res } = await api.post(`/boards/${boardId}/lists`, data);
      return res;
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    }
  });
}
function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, data }) => {
      const { data: res } = await api.put(`/lists/${listId}`, data);
      return res;
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    }
  });
}
function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId }) => {
      await api.delete(`/lists/${listId}`);
    },
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
      queryClient.invalidateQueries({ queryKey: getListBoardListsQueryKey(boardId) });
    }
  });
}
function useListTasks(listId, options) {
  return useQuery({
    queryKey: ["tasks", listId],
    queryFn: async () => {
      const { data } = await api.get(`/lists/${listId}/tasks`);
      return data;
    },
    ...options?.query
  });
}
function useGetTask(taskId, options) {
  return useQuery({
    queryKey: getGetTaskQueryKey(taskId),
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}`);
      return data;
    },
    ...options?.query
  });
}
function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, data }) => {
      const { data: res } = await api.post(`/lists/${listId}/tasks`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      api.get(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {
      });
    }
  });
}
function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.put(`/tasks/${taskId}`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(res.id) });
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      api.get(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {
      });
    }
  });
}
function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId }) => {
      await api.delete(`/tasks/${taskId}`);
    },
    onSuccess: (_, { listId, boardId }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
      queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(boardId) });
    }
  });
}
function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.patch(`/tasks/${taskId}/move`, data);
      return res;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", res.listId] });
      api.get(`/lists/${res.listId}`).then(({ data: lst }) => {
        queryClient.invalidateQueries({ queryKey: getGetBoardQueryKey(lst.boardId) });
      }).catch(() => {
      });
    }
  });
}
function useAddLabelToTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, labelId }) => {
      await api.post(`/tasks/${taskId}/labels/${labelId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    }
  });
}
function useRemoveLabelFromTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, labelId }) => {
      await api.delete(`/tasks/${taskId}/labels/${labelId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    }
  });
}
function useSearchTasks(filters, options) {
  return useQuery({
    queryKey: getTaskSearchQueryKey(filters),
    queryFn: async () => {
      const { data } = await api.get("/tasks", { params: filters });
      return data;
    },
    ...options?.query
  });
}
function useListLabels(workspaceId, options) {
  return useQuery({
    queryKey: getListLabelsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/labels`);
      return data;
    },
    ...options?.query
  });
}
function useCreateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, name, color }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/labels`, { name, color });
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    }
  });
}
function useUpdateLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labelId, name, color }) => {
      const { data } = await api.put(`/labels/${labelId}`, { name, color });
      return data;
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    }
  });
}
function useDeleteLabel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labelId }) => {
      await api.delete(`/labels/${labelId}`);
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: getListLabelsQueryKey(workspaceId) });
    }
  });
}
function useListComments(taskId, options) {
  return useQuery({
    queryKey: getListCommentsQueryKey(taskId),
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      return data;
    },
    ...options?.query
  });
}
function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }) => {
      const { data: res } = await api.post(`/tasks/${taskId}/comments`, data);
      return res;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    }
  });
}
function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, data }) => {
      const { data: res } = await api.put(`/comments/${commentId}`, data);
      return res;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
    }
  });
}
function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId }) => {
      await api.delete(`/comments/${commentId}`);
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    }
  });
}
function useListNotifications(options) {
  return useQuery({
    queryKey: getListNotificationsQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    ...options?.query
  });
}
function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    }
  });
}
function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId }) => {
      const { data } = await api.patch(`/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    }
  });
}
function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId }) => {
      await api.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    }
  });
}
function useListCalendarEvents(options) {
  return useQuery({
    queryKey: getListCalendarEventsQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/calendar/events");
      return data;
    },
    ...options?.query
  });
}
function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables) => {
      const { data } = await api.post("/calendar/events", variables);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    }
  });
}
function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, data }) => {
      const { data: res } = await api.put(`/calendar/events/${eventId}`, data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    }
  });
}
function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId }) => {
      await api.delete(`/calendar/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    }
  });
}
function useSyncTaskToCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId }) => {
      const { data } = await api.post(`/tasks/${taskId}/sync-calendar`);
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    }
  });
}
function useGetDashboardStats(options) {
  return useQuery({
    queryKey: getDashboardStatsQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/dashboard/stats");
      return data;
    },
    ...options?.query
  });
}
function useGetDashboardActivity(options) {
  return useQuery({
    queryKey: getDashboardActivityQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/dashboard/activity");
      return data;
    },
    ...options?.query
  });
}
function useGetDashboardUpcoming(options) {
  return useQuery({
    queryKey: getDashboardUpcomingQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/dashboard/upcoming");
      return data;
    },
    ...options?.query
  });
}
function useGetTaskStats(workspaceId, options) {
  return useQuery({
    queryKey: getReportsTaskStatsQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get("/reports/task-stats", {
        params: workspaceId ? { workspaceId } : {}
      });
      return data;
    },
    ...options?.query
  });
}
function useGetProjectProgress(workspaceId, options) {
  return useQuery({
    queryKey: getReportsProjectProgressQueryKey(workspaceId),
    queryFn: async () => {
      const { data } = await api.get("/reports/project-progress", {
        params: workspaceId ? { workspaceId } : {}
      });
      return data;
    },
    ...options?.query
  });
}
function useGetProductivity(workspaceId, period = "weekly", options) {
  return useQuery({
    queryKey: getReportsProductivityQueryKey(workspaceId, period),
    queryFn: async () => {
      const { data } = await api.get("/reports/productivity", {
        params: {
          period,
          ...workspaceId ? { workspaceId } : {}
        }
      });
      return data;
    },
    ...options?.query
  });
}
function useGlobalSearch(q, options) {
  return useQuery({
    queryKey: [getSearchQueryKey(q)],
    queryFn: async () => {
      const { data } = await api.get("/search", {
        params: { q }
      });
      return data;
    },
    enabled: typeof q === "string" && q.trim().length > 0,
    ...options?.query
  });
}
function useGenerateTaskDescription() {
  return useMutation({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post("/ai/generate-description", data);
      return res;
    }
  });
}
function useGenerateSubtasks() {
  return useMutation({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post("/ai/generate-subtasks", data);
      return res;
    }
  });
}
function useSuggestPriority() {
  return useMutation({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post("/ai/suggest-priority", data);
      return res;
    }
  });
}
function useDailySummary() {
  return useMutation({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post("/ai/daily-summary", data);
      return res;
    }
  });
}
function useProjectHealth() {
  return useMutation({
    mutationFn: async ({ data }) => {
      const { data: res } = await api.post("/ai/project-health", data);
      return res;
    }
  });
}
function useGetAiHistory(options) {
  return useQuery({
    queryKey: getAiHistoryQueryKey(),
    queryFn: async () => {
      const { data } = await api.get("/ai/history");
      return data;
    },
    ...options?.query
  });
}
function useUpdateProfile() {
  return useMutation({
    mutationFn: async (variables) => {
      const { data } = await api.put("/auth/profile", variables);
      return data;
    }
  });
}
export {
  getAiHistoryQueryKey,
  getDashboardActivityQueryKey,
  getDashboardStatsQueryKey,
  getDashboardUpcomingQueryKey,
  getGetBoardQueryKey,
  getGetProjectQueryKey,
  getGetTaskQueryKey,
  getGetWorkspaceQueryKey,
  getListBoardListsQueryKey,
  getListBoardsQueryKey,
  getListCalendarEventsQueryKey,
  getListCommentsQueryKey,
  getListLabelsQueryKey,
  getListNotificationsQueryKey,
  getListProjectsQueryKey,
  getListWorkspaceMembersQueryKey,
  getListWorkspacesQueryKey,
  getReportsProductivityQueryKey,
  getReportsProjectProgressQueryKey,
  getReportsTaskStatsQueryKey,
  getSearchQueryKey,
  getTaskSearchQueryKey,
  useAddLabelToTask,
  useAddWorkspaceMember,
  useCreateBoard,
  useCreateCalendarEvent,
  useCreateComment,
  useCreateLabel,
  useCreateList,
  useCreateProject,
  useCreateTask,
  useCreateWorkspace,
  useDailySummary,
  useDeleteBoard,
  useDeleteCalendarEvent,
  useDeleteComment,
  useDeleteLabel,
  useDeleteList,
  useDeleteNotification,
  useDeleteProject,
  useDeleteTask,
  useDeleteWorkspace,
  useGenerateSubtasks,
  useGenerateTaskDescription,
  useGetAiHistory,
  useGetBoard,
  useGetDashboardActivity,
  useGetDashboardStats,
  useGetDashboardUpcoming,
  useGetProductivity,
  useGetProject,
  useGetProjectProgress,
  useGetTask,
  useGetTaskStats,
  useGetWorkspace,
  useGlobalSearch,
  useListBoardLists,
  useListBoards,
  useListCalendarEvents,
  useListComments,
  useListLabels,
  useListNotifications,
  useListProjects,
  useListTasks,
  useListWorkspaceMembers,
  useListWorkspaces,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useMoveTask,
  useProjectHealth,
  useRemoveLabelFromTask,
  useRemoveWorkspaceMember,
  useSearchTasks,
  useSuggestPriority,
  useSyncTaskToCalendar,
  useUpdateBoard,
  useUpdateCalendarEvent,
  useUpdateComment,
  useUpdateLabel,
  useUpdateList,
  useUpdateProfile,
  useUpdateProject,
  useUpdateTask,
  useUpdateWorkspace
};
