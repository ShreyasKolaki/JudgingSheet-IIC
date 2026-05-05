import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth, clearAuth, type Role } from "@/lib/auth";
import { useEffect, type ComponentType } from "react";
import {
  CalendarRange,
  ListChecks,
  Trophy,
  ClipboardEdit,
  User as UserIcon,
  LogOut,
  Gavel,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin/events", label: "Manage Events", icon: CalendarRange },
    { to: "/admin/criteria", label: "Manage Criteria", icon: ListChecks },
    { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  ],
  judge: [
    { to: "/judge/score", label: "Score Entry", icon: ClipboardEdit },
    { to: "/judge/leaderboard", label: "Leaderboard", icon: Trophy },
  ],
  team: [
    { to: "/team/scores", label: "My Scores", icon: UserIcon },
    { to: "/team/leaderboard", label: "Leaderboard", icon: Trophy },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  judge: "Judge",
  team: "Team Leader",
};

export function AppLayout({ allow }: { allow: Role[] }) {
  const { auth, ready } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!auth) navigate({ to: "/login" });
    else if (!allow.includes(auth.role)) navigate({ to: "/login" });
  }, [ready, auth, allow, navigate]);

  if (!ready || !auth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  const items = NAV[auth.role];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">JudgeBoard</div>
            <div className="text-[11px] text-sidebar-foreground/60">{ROLE_LABEL[auth.role]}</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150 hover:bg-sidebar-accent active:scale-[.98] ${
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground border-l-2 border-primary"
                    : "text-sidebar-foreground/80"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => {
            clearAuth();
            navigate({ to: "/login" });
          }}
          className="m-3 flex items-center gap-2 rounded-md border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="text-sm">
            <span className="text-muted-foreground">Signed in as</span>{" "}
            <span className="font-medium text-foreground">{auth.name}</span>{" "}
            <span className="ml-2 inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {ROLE_LABEL[auth.role]}
            </span>
          </div>
          <button
            onClick={() => {
              clearAuth();
              navigate({ to: "/login" });
            }}
            className="md:hidden text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2">
          {items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition-all ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-card p-5 transition-all ${className}`}>{children}</div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}