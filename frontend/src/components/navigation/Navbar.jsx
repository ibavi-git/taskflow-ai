import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListNotifications } from "@workspace/api-client-react";



export function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const { data: notifications = [] } = useListNotifications({ query: { refetchInterval: 30000 } });
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <form onSubmit={handleSearch} className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tasks, projects, people"
            className="h-10 bg-background pl-9"
          />
        </form>
      </div>

      <div className="ml-4 flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link to="/notifications" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link to="/profile" aria-label="Profile">
            <UserRound className="h-5 w-5" />
          </Link>
        </Button>
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link to="/settings" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
        <div className="hidden min-w-0 text-right sm:block">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
