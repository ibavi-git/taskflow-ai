import { api } from "./api";

export const dashboardService = {
  async getStats() {
    const { data } = await api.get("/dashboard/stats");
    return data;
  },

  async getActivity() {
    const { data } = await api.get("/dashboard/activity");
    return data;
  },

  async getUpcoming() {
    const { data } = await api.get("/dashboard/upcoming");
    return data;
  },
};
