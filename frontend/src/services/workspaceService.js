import { api } from "./api";

export const workspaceService = {
  async listWorkspaces() {
    const { data } = await api.get("/workspaces");
    return data;
  },
};
