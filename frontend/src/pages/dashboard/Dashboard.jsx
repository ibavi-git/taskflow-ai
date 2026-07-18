import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarDays, CheckCircle2, Clock3, FolderKanban, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import { getApiErrorMessage } from "@/services/api";
import { Loader } from "@/components/common/Loader";
const defaultStats = {
  totalProjects: 0,
  completedTasks: 0,
  pendingTasks: 0,
  todayTasks: 0,
  unreadNotifications: 0,
  completionPercentage: 0
};
const cards = [
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban },
  { key: "pendingTasks", label: "Pending Tasks", icon: Clock3 },
  { key: "completedTasks", label: "Completed Tasks", icon: CheckCircle2 },
  { key: "todayTasks", label: "Due Today", icon: CalendarDays }
];
function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat(void 0, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
function Dashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [activities, setActivities] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [statsData, activityData, upcomingData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(),
          dashboardService.getUpcoming()
        ]);
        if (!active) return;
        setStats(statsData);
        setActivities(activityData);
        setUpcoming(upcomingData);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);
  if (loading) {
    return <Loader label="Loading dashboard" />;
  }
  return <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live overview from the TaskFlow AI backend.</p>
        </div>
        <Button asChild>
          <Link to="/projects">Open Workspaces</Link>
        </Button>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <article key={card.key} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 text-3xl font-semibold">{stats[card.key]}</p>
          </article>)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Upcoming Work
            </h2>
          </div>
          <div className="divide-y divide-border">
            {upcoming.length > 0 ? upcoming.slice(0, 8).map((task) => <Link key={task.id} to={`/task/${task.id}`} className="block p-5 transition-colors hover:bg-accent/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{task.status}</p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium">{task.priority}</p>
                      <p className="text-muted-foreground">{formatDate(task.dueDate)}</p>
                    </div>
                  </div>
                </Link>) : <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                <Inbox className="mb-3 h-8 w-8" />
                <p>No upcoming deadlines returned by the backend.</p>
              </div>}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-border">
            {activities.length > 0 ? activities.slice(0, 10).map((item) => <div key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.entityType}: {item.entityName}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                </div>) : <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                <Inbox className="mb-3 h-8 w-8" />
                <p>No activity returned by the backend yet.</p>
              </div>}
          </div>
        </article>
      </section>
    </div>;
}
export {
  Dashboard as default
};
