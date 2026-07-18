import {
  Search as SearchIcon,
  FolderKanban,
  UserRound,
  CheckSquare,
  Filter,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader } from "@/components/common/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalSearch, useSearchTasks } from "@workspace/api-client-react";
import { useState } from "react";
function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const { data: results, isLoading, error } = useGlobalSearch(query);
  const { data: filteredTasks = [], isLoading: tasksLoading } = useSearchTasks(
    { q: query || void 0, priority: priority === "all" ? void 0 : priority, status: status === "all" ? void 0 : status },
    { query: { enabled: Boolean(query || priority !== "all" || status !== "all") } }
  );
  return <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search across tasks, projects, and people using the backend search endpoint.</p>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{String(error)}</p> : null}

      {isLoading ? <Loader label="Searching" /> : null}

      {!isLoading && query ? <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" />Filtered task endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {["BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "DONE"].map((item) => <SelectItem key={item} value={item}>{item.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {tasksLoading ? <Loader label="Loading filtered tasks" /> : <div className="grid gap-3 md:grid-cols-2">
                  {filteredTasks.length ? filteredTasks.slice(0, 8).map((task) => <Link key={task.id} to={`/task/${task.id}`} className="rounded-md border border-border bg-background/70 p-3 text-sm hover:border-primary/40">
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-muted-foreground">{task.priority} / {task.status}</p>
                    </Link>) : <p className="text-sm text-muted-foreground">No tasks from `/tasks` matched these filters.</p>}
                </div>}
            </CardContent>
          </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary" />Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results?.tasks?.length ? results.tasks.map((task) => <Link key={task.id} to={`/task/${task.id}`} className="block rounded-lg border border-border bg-background/70 p-3 text-sm hover:border-primary/40">
                  <p className="font-medium">{task.title}</p>
                  <p className="mt-1 text-muted-foreground">{task.status}</p>
                </Link>) : <p className="text-sm text-muted-foreground">No matching tasks.</p>}
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-primary" />Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results?.projects?.length ? results.projects.map((project) => <Link key={project.id} to={`/project/${project.id}`} className="block rounded-lg border border-border bg-background/70 p-3 text-sm hover:border-primary/40">
                  <p className="font-medium">{project.name}</p>
                  <p className="mt-1 text-muted-foreground">{project.status}</p>
                </Link>) : <p className="text-sm text-muted-foreground">No matching projects.</p>}
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results?.users?.length ? results.users.map((user) => <div key={user.id} className="rounded-lg border border-border bg-background/70 p-3 text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="mt-1 text-muted-foreground">{user.email}</p>
                </div>) : <p className="text-sm text-muted-foreground">No matching people.</p>}
            </CardContent>
          </Card>
        </div>
        </div> : <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          <Search className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p>Use the search bar in the header to find tasks, projects, and users.</p>
        </div>}
    </div>;
}
export {
  Search as default
};
