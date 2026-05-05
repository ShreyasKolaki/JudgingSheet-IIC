import { useEffect, useState } from "react";
import { api, type LeaderRow, type Event } from "@/lib/api";
import { Card, EmptyState } from "./AppLayout";
import { Trophy } from "lucide-react";

export function Leaderboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents().then((e) => {
      setEvents(e);
      if (e.length) setEventId((cur) => cur || e[0].id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    const load = () => {
      api.getLeaderboard(eventId).then((r) => {
        if (!cancelled) {
          setRows(r);
          setLoading(false);
        }
      });
    };
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [eventId]);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-primary" /> Live Leaderboard
          <span className="text-xs text-muted-foreground font-normal">(auto-refresh 5s)</span>
        </div>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-6 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-6">
          <EmptyState title="No scores yet" hint="Once judges submit, rankings will appear here." />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left w-20">Rank</th>
              <th className="px-5 py-3 text-left">Team</th>
              <th className="px-5 py-3 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const top = r.rank <= 3;
              const tone =
                r.rank === 1
                  ? "bg-secondary/60"
                  : r.rank === 2
                  ? "bg-secondary/40"
                  : r.rank === 3
                  ? "bg-secondary/20"
                  : "";
              return (
                <tr
                  key={r.team_id}
                  className={`border-t border-border transition-colors hover:bg-muted/40 ${tone}`}
                >
                  <td className="px-5 py-3 font-semibold">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                        top ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      {r.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium">{r.team_name}</td>
                  <td className="px-5 py-3 text-right font-mono">{r.total.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}