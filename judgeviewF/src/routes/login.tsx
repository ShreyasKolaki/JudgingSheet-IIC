import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { setAuth, getAuth, roleHome, type Role } from "@/lib/auth";
import { api } from "@/lib/api";
import { Gavel, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "admin", label: "Admin", hint: "Manage events, criteria & rankings" },
  { value: "judge", label: "Judge", hint: "Score teams across criteria" },
  { value: "team", label: "Team Leader", hint: "View your team's results" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("demo");
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const a = getAuth();
    if (a) navigate({ to: roleHome[a.role] });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password, role);
      setAuth(res);
      toast.success(`Welcome, ${res.name}`);
      navigate({ to: roleHome[role] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">JudgeBoard</div>
            <div className="text-xs text-muted-foreground">Judging dashboard & leaderboard</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose your role to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            <Field label="Role">
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const active = role === r.value;
                  return (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setRole(r.value)}
                      className={`rounded-md border px-2 py-2 text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[.98] ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-secondary"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {ROLES.find((r) => r.value === role)?.hint}
              </p>
            </Field>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-150 hover:scale-[1.01] active:scale-[.99] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo build — connects to FastAPI <code className="rounded bg-muted px-1">/api/auth/login</code> when wired.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}