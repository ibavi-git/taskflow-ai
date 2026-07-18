import { useState } from "react";
import { BarChart3, FolderKanban, ListChecks, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/common/Loader";
import { useGetProductivity, useGetProjectProgress, useGetTaskStats } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const chartColors = ["#7c3aed", "#0891b2", "#16a34a", "#f59e0b", "#ef4444"];
function Reports() {
  const [period, setPeriod] = useState("weekly");
  const { data: stats, isLoading: statsLoading } = useGetTaskStats();
  const { data: progress = [], isLoading: progressLoading } = useGetProjectProgress();
  const { data: productivity = [], isLoading: productivityLoading } = useGetProductivity(void 0, period);
  const statusData = Object.entries(stats?.byStatus ?? {}).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(stats?.byPriority ?? {}).map(([name, value]) => ({ name, value }));
  return <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Delivery health and team output from the backend reporting endpoints.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {statsLoading || progressLoading || productivityLoading ? <Loader label="Loading reports" /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><ListChecks className="h-4 w-4 text-primary" />Task overview</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{stats?.total ?? 0}</p><p className="mt-2 text-sm text-muted-foreground">{stats?.overdue ?? 0} overdue, {stats?.completedToday ?? 0} completed today</p></CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Productivity</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{productivity[0]?.completed ?? 0}</p><p className="mt-2 text-sm text-muted-foreground">Completed tasks in latest period</p></CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" />Completion</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-semibold">{stats?.byStatus?.DONE ?? 0}</p><p className="mt-2 text-sm text-muted-foreground">Tasks marked done</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle>Status mix</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={48}>
                  {statusData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><CardTitle>Priority load</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((_, index) => <Cell key={index} fill={chartColors[(index + 1) % chartColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" />Project progress</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {progress.length > 0 ? progress.map((item) => <div key={item.projectId}>
                <div className="mb-2 flex items-center justify-between text-sm"><span>{item.projectName}</span><span className="text-muted-foreground">{item.completed}/{item.total}</span></div>
                <Progress value={item.percentage} />
              </div>) : <p className="text-sm text-muted-foreground">No project progress data returned yet.</p>}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle>Productivity trend</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {productivity.length > 0 ? productivity.map((entry) => <div key={entry.label} className="rounded-md border border-border bg-background/60 p-3">
                <div className="mb-2 flex items-center justify-between text-sm"><span>{entry.label}</span><span className="text-muted-foreground">{entry.completed}/{entry.created}</span></div>
                <Progress value={entry.created ? entry.completed / entry.created * 100 : 0} />
              </div>) : <p className="text-sm text-muted-foreground">No productivity entries returned yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>;
}
export {
  Reports as default
};
