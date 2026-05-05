import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, EmptyState, PageHeader } from "@/components/AppLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/scores")({
  component: TeamScores,
});

function TeamScores() {
  const { auth } = useAuth();
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [eventId, setEventId] = useState("");
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getMyScores>> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getEvents()
      .then((e) => {
        setEvents(e);
        if (e.length) setEventId(e[0].id);
      })
      .catch(() => toast.error("Failed to load events"));
  }, []);

  useEffect(() => {
    if (!eventId || !auth) return;
    setLoading(true);
    setData(null);
    api.getMyScores(eventId, auth.email)
      .then(setData)
      .catch(() => toast.error("Failed to load your scores"))
      .finally(() => setLoading(false));
  }, [eventId, auth]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="My Scores"
        subtitle="Detailed breakdown of judge scores by criterion."
        action={
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your scores…
        </div>
      ) : !data?.team ? (
        <EmptyState
          title="No team found"
          hint="Your account isn't linked to a team in this event yet."
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="No criteria configured"
          hint="The admin hasn't added scoring criteria for this event."
        />
      ) : (
        <>
          <div className="mb-3 text-sm text-muted-foreground">
            Showing scores for <span className="font-medium text-foreground">{data.team.name}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.items.map((it) => (
              <Card key={it.criterion}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{it.criterion}</div>
                    <div className="text-xs text-muted-foreground">Weight ×{it.weight}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-semibold ${it.score > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {it.score > 0 ? it.score.toFixed(1) : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">/ {it.max}</div>
                  </div>
                </div>
                {it.score > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${(it.score / it.max) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Card className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Weighted total score</span>
            <span className="text-2xl font-semibold">
              {data.total > 0 ? data.total.toFixed(1) : "—"}
            </span>
          </Card>
        </>
      )}
    </div>
  );
}