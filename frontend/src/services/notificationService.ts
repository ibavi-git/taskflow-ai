import { api } from "./api";

export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  taskId?: number | null;
  createdAt: string;
}

export const notificationService = {
  async listNotifications() {
    const { data } = await api.get<Notification[]>("/notifications");
    return data;
  },
};
