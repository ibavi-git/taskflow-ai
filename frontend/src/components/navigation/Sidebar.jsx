import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Workspaces", to: "/projects", icon: FolderKanban },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Reports", to: "/reports", icon: BarChart3 },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Search", to: "/search", icon: Search },
  { label: "Profile", to: "/profile", icon: UserRound },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          collapsed ? "lg:w-20" : "lg:w-64"
        } w-64 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-sm">
              TF
            </span>

            {!collapsed && (
              <span className="truncate text-lg font-semibold tracking-tight">
                TaskFlow AI
              </span>
            )}
          </NavLink>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    group
                    flex
                    h-11
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                    }
                    ${collapsed ? "lg:justify-center lg:px-0" : ""}
                    `
                  }
                >
                  <item.icon
                    className="h-5 w-5 shrink-0 flex-none"
                    strokeWidth={2}
                  />

                  {!collapsed && (
                    <span className="leading-none whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </TooltipTrigger>

              {collapsed && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="hidden border-t border-sidebar-border p-3 lg:block">
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleCollapse}
            className={`h-11 transition-all ${
              collapsed
                ? "w-full justify-center"
                : "w-full justify-start gap-2"
            }`}
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronsLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}