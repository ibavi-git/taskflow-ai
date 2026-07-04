import { api } from "./api";
import type { ActivityLog, DashboardStats, TaskSummary } from "@/types/dashboard";

export const dashboardService = {
  async getStats() {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },

  async getActivity() {
    const { data } = await api.get<ActivityLog[]>("/dashboard/activity");
    return data;
  },

  async getUpcoming() {
    const { data } = await api.get<TaskSummary[]>("/dashboard/upcoming");
    return data;
  },
};
