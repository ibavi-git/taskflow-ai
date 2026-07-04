import { api } from "./api";

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

export const workspaceService = {
  async listWorkspaces() {
    const { data } = await api.get<Workspace[]>("/workspaces");
    return data;
  },
};
