import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Criterion, type Event } from "@/lib/api";
import { Card, EmptyState, PageHeader } from "@/components/AppLayout";
import { Plus, Trash2, Loader2, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/criteria")({
  component: AdminCriteria,
});

function AdminCriteria() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Criterion | null>(null);

  const [form, setForm] = useState({ name: "", max_score: 10, weight: 1, priority: 1 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.getEvents().then((e) => {
      setEvents(e);
      if (e.length) setEventId(e[0].id);
    });
  }, []);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    api.getCriteria(eventId).then((c) => { setCriteria(c); setLoading(false); });
  }, [eventId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !eventId) return;
    setCreating(true);
    try {
      await api.createCriterion({ ...form, event_id: eventId });
      setForm({ name: "", max_score: 10, weight: 1, priority: criteria.length + 1 });
      toast.success("Criterion added");
      setCriteria(await api.getCriteria(eventId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add criterion");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      await api.updateCriterion(editing);
      toast.success("Updated");
      setEditing(null);
      setCriteria(await api.getCriteria(eventId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update criterion");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete criterion?")) return;
    try {
      await api.deleteCriterion(id);
      setCriteria(await api.getCriteria(eventId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete criterion");
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Manage Criteria" subtitle="Define how teams are scored for each event." />

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Event</label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      <Card className="mb-6">
        <form onSubmit={add} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Criterion Name</label>
              <Input placeholder="e.g. Innovation" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Max Score</label>
              <Input type="number" placeholder="10" value={String(form.max_score)} onChange={(v) => setForm({ ...form, max_score: +v || 0 })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Weight ×</label>
              <Input type="number" step="0.1" placeholder="1.0" value={String(form.weight)} onChange={(v) => setForm({ ...form, weight: +v || 0 })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority #</label>
              <Input type="number" placeholder="1" value={String(form.priority)} onChange={(v) => setForm({ ...form, priority: +v || 0 })} />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.01] active:scale-[.99] disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add Criterion
          </button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />)}</div>
        ) : criteria.length === 0 ? (
          <div className="p-6"><EmptyState title="No criteria yet" hint="Add criteria to start scoring." /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold uppercase tracking-wide">Criterion Name</th>
                <th className="px-5 py-3 text-right w-28">
                  <div className="font-semibold uppercase tracking-wide">Max Score</div>
                  <div className="text-[10px] font-normal normal-case opacity-70">upper limit</div>
                </th>
                <th className="px-5 py-3 text-right w-28">
                  <div className="font-semibold uppercase tracking-wide">Weight ×</div>
                  <div className="text-[10px] font-normal normal-case opacity-70">score multiplier</div>
                </th>
                <th className="px-5 py-3 text-right w-28">
                  <div className="font-semibold uppercase tracking-wide">Priority #</div>
                  <div className="text-[10px] font-normal normal-case opacity-70">tie-breaker order</div>
                </th>
                <th className="px-5 py-3 text-right w-28 font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => {
                const isEdit = editing?.id === c.id;
                const cur = isEdit && editing ? editing : c;
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-2.5">{isEdit ? <Input value={cur.name} onChange={(v) => setEditing({ ...cur, name: v })} /> : c.name}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{isEdit ? <Input type="number" value={String(cur.max_score)} onChange={(v) => setEditing({ ...cur, max_score: +v })} /> : c.max_score}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{isEdit ? <Input type="number" value={String(cur.weight)} onChange={(v) => setEditing({ ...cur, weight: +v })} /> : c.weight}</td>
                    <td className="px-5 py-2.5 text-right font-mono">{isEdit ? <Input type="number" value={String(cur.priority)} onChange={(v) => setEditing({ ...cur, priority: +v })} /> : c.priority}</td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="inline-flex gap-1">
                        {isEdit ? (
                          <>
                            <Btn onClick={saveEdit}><Check className="h-4 w-4" /></Btn>
                            <Btn onClick={() => setEditing(null)}><X className="h-4 w-4" /></Btn>
                          </>
                        ) : (
                          <>
                            <Btn onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Btn>
                            <Btn danger onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, className = "", step }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string; step?: string }) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${className}`}
    />
  );
}

function Btn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-all hover:scale-[1.05] active:scale-[.95] ${
        danger ? "text-destructive hover:bg-destructive/10 hover:border-destructive/40" : "text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}