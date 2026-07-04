import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Brain, CalendarDays, CheckCircle2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  { label: "Workspace planning", icon: LayoutDashboard },
  { label: "Project analytics", icon: BarChart3 },
  { label: "Calendar deadlines", icon: CalendarDays },
  { label: "AI task assistance", icon: Brain },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              TF
            </span>
            <span className="font-semibold tracking-normal">TaskFlow AI</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Create account</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-normal text-primary">Modern project management</p>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              TaskFlow AI
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Organize workspaces, projects, boards, tasks, deadlines, reports, and AI productivity actions from one
              focused SaaS dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/register">
                Start planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Open workspace</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="space-y-4 rounded-md bg-background p-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dashboard preview</p>
                <p className="text-xl font-semibold">Product launch board</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {["Backlog", "In Progress", "Done"].map((column, index) => (
                <div key={column} className="rounded-md border border-border bg-card p-3">
                  <p className="text-sm font-medium">{column}</p>
                  <div className="mt-3 space-y-2">
                    {Array.from({ length: index + 1 }).map((_, cardIndex) => (
                      <div key={cardIndex} className="rounded-md border border-border bg-background p-3">
                        <div className="h-2 w-2/3 rounded bg-muted" />
                        <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
