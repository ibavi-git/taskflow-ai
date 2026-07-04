// @ts-nocheck
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetWorkspace, 
  useListProjects,
  useCreateProject,
  useListWorkspaceMembers,
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
  getGetWorkspaceQueryKey,
  getListProjectsQueryKey,
  getListWorkspaceMembersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderKanban, 
  Plus, 
  Settings, 
  Users, 
  Briefcase, 
  Trash2,
  Mail
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function WorkspaceDetail({ params }: { params: { workspaceId: string } }) {
  const workspaceId = parseInt(params.workspaceId);
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace(workspaceId, {
    query: { enabled: !!workspaceId, queryKey: getGetWorkspaceQueryKey(workspaceId) }
  });
  
  const { data: projects, isLoading: projectsLoading } = useListProjects(workspaceId, {
    query: { enabled: !!workspaceId, queryKey: getListProjectsQueryKey(workspaceId) }
  });

  const { data: members, isLoading: membersLoading } = useListWorkspaceMembers(workspaceId, {
    query: { enabled: !!workspaceId, queryKey: getListWorkspaceMembersQueryKey(workspaceId) }
  });

  const createProject = useCreateProject();
  const addMember = useAddWorkspaceMember();
  const removeMember = useRemoveWorkspaceMember();

  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");

  const handleCreateProject = () => {
    if (!projectName) return;
    createProject.mutate(
      { 
        workspaceId,
        data: { name: projectName, description: projectDesc } 
      },
      {
        onSuccess: (proj) => {
          setIsProjectOpen(false);
          setProjectName("");
          setProjectDesc("");
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey(workspaceId) });
          setLocation(`/project/${proj.id}`);
        }
      }
    );
  };

  const handleAddMember = () => {
    if (!memberEmail) return;
    addMember.mutate(
      {
        workspaceId,
        data: { email: memberEmail, role: "MEMBER" }
      },
      {
        onSuccess: () => {
          setIsMemberOpen(false);
          setMemberEmail("");
          queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
        }
      }
    );
  };

  const handleRemoveMember = (userId: number) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMember.mutate(
        { workspaceId, userId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListWorkspaceMembersQueryKey(workspaceId) });
          }
        }
      );
    }
  };

  if (workspaceLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return <div className="p-8 text-center">Workspace not found</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
              style={{ backgroundColor: workspace.color || 'hsl(var(--primary))' }}
            >
              {getInitials(workspace.name)}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
          </div>
          {workspace.description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{workspace.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={isProjectOpen} onOpenChange={setIsProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
                <DialogDescription>Start a new initiative within {workspace.name}.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Q3 Marketing Launch" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Optional details..." />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!projectName || createProject.isPending} onClick={handleCreateProject}>
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-6 mt-0">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projectsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)
            ) : projects && projects.length > 0 ? (
              projects.map(project => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card className="bg-card hover-elevate border-border cursor-pointer h-full transition-all group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">{project.name}</CardTitle>
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: project.color || 'var(--primary)' }}
                        />
                      </div>
                      <CardDescription className="line-clamp-2 mt-1 min-h-[2.5rem]">
                        {project.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-3.5 w-3.5" />
                          <span>{project.boardCount || 0} boards</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{project.taskCount || 0} tasks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl bg-card">
                <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating a project for your team.</p>
                <Button onClick={() => setIsProjectOpen(true)}>Create Project</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-0">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle>Workspace Members</CardTitle>
                <CardDescription>Manage who has access to this workspace.</CardDescription>
              </div>
              <Dialog open={isMemberOpen} onOpenChange={setIsMemberOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                    <DialogDescription>Add a team member to {workspace.name}.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email address</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="colleague@company.com" type="email" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={!memberEmail || addMember.isPending} onClick={handleAddMember}>
                      {addMember.isPending ? "Inviting..." : "Send Invite"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {membersLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : members && members.length > 0 ? (
                  members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.user?.avatar || undefined} />
                          <AvatarFallback>{member.user ? getInitials(member.user.name) : "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.user?.name || "Unknown User"}</div>
                          <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs uppercase font-medium px-2 py-1 bg-accent rounded text-muted-foreground">
                          {member.role}
                        </div>
                        {member.role !== "ADMIN" && workspace.ownerId !== member.userId && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveMember(member.userId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No members found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
