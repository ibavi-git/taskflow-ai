import { api } from "./api";

export const notificationService = {
  async listNotifications() {
    const { data } = await api.get("/notifications");
    return data;
  },
};
