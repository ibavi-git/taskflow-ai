import { BarChart3, FolderKanban, ListChecks, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/common/Loader";
import { useGetProductivity, useGetProjectProgress, useGetTaskStats } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";

export default function Reports() {
  const { data: stats, isLoading: statsLoading } = useGetTaskStats();
  const { data: progress = [], isLoading: progressLoading } = useGetProjectProgress();
  const { data: productivity = [], isLoading: productivityLoading } = useGetProductivity();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track delivery health and team output from the backend reporting endpoints.</p>
      </div>

      {(statsLoading || progressLoading || productivityLoading) ? <Loader label="Loading reports" /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><ListChecks className="h-4 w-4 text-primary" />Task overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.total ?? 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stats?.overdue ?? 0} overdue • {stats?.completedToday ?? 0} completed today</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{productivity[0]?.completed ?? 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">Completed tasks in the latest period</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats?.byStatus?.DONE ?? 0}</p>
            <p className="mt-2 text-sm text-muted-foreground">Tasks marked done</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" />Project progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.length > 0 ? progress.map((item) => (
              <div key={item.projectId}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.projectName}</span>
                  <span className="text-muted-foreground">{item.completed}/{item.total}</span>
                </div>
                <Progress value={item.percentage} />
              </div>
            )) : <p className="text-sm text-muted-foreground">No project progress data returned yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Productivity trend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productivity.length > 0 ? productivity.map((entry) => (
              <div key={entry.label} className="rounded-lg border border-border bg-background/60 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{entry.label}</span>
                  <span className="text-muted-foreground">{entry.completed} completed</span>
                </div>
                <Progress value={entry.created ? (entry.completed / entry.created) * 100 : 0} />
              </div>
            )) : <p className="text-sm text-muted-foreground">No productivity entries returned yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
