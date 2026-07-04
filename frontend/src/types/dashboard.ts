import type { User } from "./auth";

export interface DashboardStats {
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  todayTasks: number;
  unreadNotifications: number;
  completionPercentage: number;
}

export interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityName: string;
  user: User | null;
  createdAt: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  workspaceId: number;
}

export interface TaskSummary {
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
