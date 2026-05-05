import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Criterion, type Event, type Team } from "@/lib/api";
import { Card, EmptyState, PageHeader } from "@/components/AppLayout";
import { Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/judge/score")({
  component: JudgeScore,
});

function JudgeScore() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getEvents()
      .then((e) => {
        setEvents(e);
        if (e.length) setEventId(e[0].id);
      })
      .catch(() => toast.error("Failed to load events"));
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setTeams([]);
    setTeamId("");
    setCriteria([]);
    setScores({});
    setError("");

    setLoadingTeams(true);
    api.getTeams(eventId)
      .then((t) => {
        setTeams(t);
        setTeamId(t[0]?.id || "");
      })
      .catch(() => {
        setError("Could not load teams for this event.");
        toast.error("Failed to load teams");
      })
      .finally(() => setLoadingTeams(false));

    setLoadingCriteria(true);
    api.getCriteria(eventId)
      .then(setCriteria)
      .catch(() => toast.error("Failed to load criteria"))
      .finally(() => setLoadingCriteria(false));
  }, [eventId]);

  const valid = (v: string, max: number) => {
    if (v === "") return true;
    const n = +v;
    return !isNaN(n) && n >= 0 && n <= max;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return toast.error("Please select a team");
    const payload = criteria
      .filter((c) => scores[c.id] !== undefined && scores[c.id] !== "")
      .map((c) => ({ team_id: teamId, event_id: eventId, criterion_id: c.id, score: +scores[c.id] }));
    if (!payload.length) return toast.error("Enter at least one score");
    const invalid = payload.some((s) => !valid(String(s.score), criteria.find((c) => c.id === s.criterion_id)!.max_score));
    if (invalid) return toast.error("Some scores are out of range (0–10)");
    setSubmitting(true);
    try {
      await api.submitScores(payload);
      toast.success("Scores submitted successfully!");
      setScores({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Score Entry" subtitle="Score teams across the configured criteria." />

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Event">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {events.length === 0 && <option value="">No events available</option>}
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>

          <Field label={`Team${loadingTeams ? " (loading…)" : ""}`}>
            {error ? (
              <div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
              </div>
            ) : (
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={loadingTeams || teams.length === 0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              >
                {loadingTeams && <option value="">Loading teams…</option>}
                {!loadingTeams && teams.length === 0 && <option value="">No teams found</option>}
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </Field>
        </div>
      </Card>

      <form onSubmit={submit}>
        <Card className="p-0 overflow-hidden mb-4">
          {loadingCriteria ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />)}
            </div>
          ) : criteria.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No criteria configured"
                hint="Ask the admin to add criteria for this event first."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {criteria.map((c) => {
                const v = scores[c.id] ?? "";
                const ok = valid(v, c.max_score);
                return (
                  <div key={c.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Max {c.max_score} · weight {c.weight} · priority #{c.priority}
                      </div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={c.max_score}
                      step="0.5"
                      value={v}
                      onChange={(e) => setScores({ ...scores, [c.id]: e.target.value })}
                      placeholder="—"
                      className={`w-24 rounded-md border bg-background px-3 py-2 text-right text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.03] ${
                        ok ? "border-border" : "border-destructive ring-1 ring-destructive/30"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <button
          type="submit"
          disabled={submitting || !criteria.length || !teamId}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit Scores
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}