// @ts-nocheck
import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  useGetTask,
  useUpdateTask,
  useListComments,
  useCreateComment,
  useGenerateTaskDescription,
  useGenerateSubtasks,
  useSuggestPriority,
  useSyncTaskToCalendar,
  getGetTaskQueryKey,
  getListCommentsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User as UserIcon,
  MessageSquare,
  Bot,
  Wand2,
  CalendarDays,
  Send,
  Sparkles
} from "lucide-react";
import { priorityColors, statusColors, getInitials } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function TaskDetail({ params }: { params: { taskId: string } }) {
  const taskId = parseInt(params.taskId);
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: task, isLoading: taskLoading } = useGetTask(taskId, {
    query: { enabled: !!taskId, queryKey: getGetTaskQueryKey(taskId) }
  });

  const { data: comments, isLoading: commentsLoading } = useListComments(taskId, {
    query: { enabled: !!taskId, queryKey: getListCommentsQueryKey(taskId) }
  });

  const updateTask = useUpdateTask();
  const createComment = useCreateComment();
  const syncCalendar = useSyncTaskToCalendar();
  
  // AI Hooks
  const generateDesc = useGenerateTaskDescription();
  const generateSubtasks = useGenerateSubtasks();
  const suggestPriority = useSuggestPriority();

  const [commentText, setCommentText] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descText, setDescText] = useState("");

  // Init description when task loads
  React.useEffect(() => {
    if (task && !isEditingDesc) {
      setDescText(task.description || "");
    }
  }, [task, isEditingDesc]);

  const handleUpdateDescription = () => {
    updateTask.mutate(
      { taskId, data: { description: descText } },
      {
        onSuccess: () => {
          setIsEditingDesc(false);
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
          toast({ title: "Task updated" });
        }
      }
    );
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate(
      { taskId, data: { content: commentText } },
      {
        onSuccess: () => {
          setCommentText("");
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(taskId) });
        }
      }
    );
  };

  const handleSyncCalendar = () => {
    syncCalendar.mutate(
      { taskId },
      {
        onSuccess: () => {
          toast({ title: "Synced to calendar", description: "Event created successfully." });
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
        },
        onError: () => {
          toast({ title: "Sync failed", variant: "destructive" });
        }
      }
    );
  };

  // AI Actions
  const handleAIGenerateDesc = () => {
    generateDesc.mutate(
      { data: { prompt: "Generate a detailed description based on the title.", taskId } },
      {
        onSuccess: (res) => {
          setDescText(res.result);
          setIsEditingDesc(true);
        }
      }
    );
  };

  const handleAIGenerateSubtasks = () => {
    generateSubtasks.mutate(
      { data: { prompt: "Break this task down into subtasks.", taskId } },
      {
        onSuccess: (res) => {
          setCommentText((prev) => prev + (prev ? "\n\n" : "") + "AI Suggested Subtasks:\n" + res.result);
        }
      }
    );
  };

  if (taskLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Skeleton className="col-span-2 h-64" />
          <Skeleton className="col-span-1 h-64" />
        </div>
      </div>
    );
  }

  if (!task) return <div>Task not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="ghost" className="mb-6 -ml-4" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                {task.priority} Priority
              </Badge>
              <Badge variant="outline" className={statusColors[task.status as keyof typeof statusColors]}>
                {task.status.replace("_", " ")}
              </Badge>
              {task.labels?.map(label => (
                <Badge key={label.id} variant="outline" style={{ borderColor: label.color, color: label.color }}>
                  {label.name}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments {((task as any).commentCount ?? 0) > 0 && `(${(task as any).commentCount})`}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 space-y-6">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                  <h3 className="font-semibold flex items-center gap-2">
                    Description
                  </h3>
                  {!isEditingDesc ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(true)}>Edit</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleUpdateDescription}>Save</Button>
                    </div>
                  )}
                </div>
                <div className="p-4 min-h-[150px]">
                  {isEditingDesc ? (
                    <Textarea 
                      value={descText} 
                      onChange={(e) => setDescText(e.target.value)} 
                      className="min-h-[200px]"
                      placeholder="Add a more detailed description..."
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-muted-foreground">
                      {task.description ? task.description : "No description provided."}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-6 space-y-6">
              <div className="space-y-4">
                {commentsLoading ? (
                  [1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
                ) : comments && comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar || undefined} />
                        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt ? format(new Date(comment.createdAt), "MMM d, h:mm a") : ""}
                          </span>
                        </div>
                        <div className="bg-card border border-border p-3 rounded-lg text-sm whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                    No comments yet.
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 mt-6">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>Me</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea 
                    placeholder="Add a comment..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      disabled={!commentText.trim() || createComment.isPending} 
                      onClick={handleAddComment}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground flex items-center gap-2 col-span-1">
                  <UserIcon className="h-4 w-4" />
                  Assignee
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.avatar || undefined} />
                        <AvatarFallback className="text-[10px]">{getInitials(task.assignee.name)}</AvatarFallback>
                      </Avatar>
                      <span>{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground flex items-center gap-2 col-span-1">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </div>
                <div className="col-span-2">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground flex items-center gap-2 col-span-1">
                  <Clock className="h-4 w-4" />
                  Estimate
                </div>
                <div className="col-span-2">
                  {task.estimatedHours ? `${task.estimatedHours} hours` : "None"}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="text-muted-foreground flex items-center gap-2 col-span-1">
                  <Clock className="h-4 w-4" />
                  Spent
                </div>
                <div className="col-span-2">
                  {task.spentHours ? `${task.spentHours} hours` : "None"}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 border-t border-border mt-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full mt-4 justify-start" 
                disabled={syncCalendar.isPending}
                onClick={handleSyncCalendar}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {syncCalendar.isPending ? "Syncing..." : "Sync to Calendar"}
              </Button>
            </CardFooter>
          </Card>

          {/* AI Panel */}
          <Card className="bg-card border-primary/20 shadow-md shadow-primary/5">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start hover:text-primary hover:border-primary/50"
                onClick={handleAIGenerateDesc}
                disabled={generateDesc.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Draft Description
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start hover:text-primary hover:border-primary/50"
                onClick={handleAIGenerateSubtasks}
                disabled={generateSubtasks.isPending}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Suggest Subtasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
