import { UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8">
      <UserRound className="mb-4 h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold tracking-normal">Profile</h1>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Name</p>
          <p className="mt-1 font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="mt-1 font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="mt-1 font-medium">{user?.role}</p>
        </div>
      </div>
    </div>
  );
}
