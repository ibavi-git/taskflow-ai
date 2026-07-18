import { Link } from "react-router-dom";

export function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden border-r border-border bg-muted/40 p-10 lg:flex lg:flex-col lg:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
                TF
              </span>
              <span className="text-lg font-semibold">TaskFlow AI</span>
            </Link>

            <div className="space-y-4">
              <p className="max-w-md text-3xl font-semibold leading-tight">
                Plan projects, track tasks, and keep team work moving.
              </p>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Built around the Spring Boot API: JWT auth, workspaces, projects, boards, tasks, reports, and AI actions.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">{children}</section>
        </div>
      </div>
    </main>
  );
}
