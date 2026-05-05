import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api, type Event } from "@/lib/api";
import { Card, EmptyState, PageHeader } from "@/components/AppLayout";
import { Pencil, Trash2, Plus, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({
  component: AdminEvents,
});

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const refresh = () => api.getEvents().then((e) => { setEvents(e); setLoading(false); });
  useEffect(() => { refresh(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.createEvent(name.trim());
      setName("");
      toast.success("Event created");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  }

  async function save(id: string) {
    try {
      await api.updateEvent(id, editValue);
      setEditingId(null);
      toast.success("Updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update event");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this event? This will remove all related criteria and teams.")) return;
    try {
      await api.deleteEvent(id);
      toast.success("Event deleted");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Manage Events" subtitle="Create and curate the events being judged." />

      <Card className="mb-6">
        <form onSubmit={create} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New event name…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] active:scale-[.98] disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Event
          </button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="p-6"><EmptyState title="No events yet" hint="Create your first event above." /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left">Event</th>
                <th className="px-5 py-3 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className="border-t border-border transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">
                    {editingId === ev.id ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    ) : ev.name}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {editingId === ev.id ? (
                        <>
                          <IconBtn onClick={() => save(ev.id)}><Check className="h-4 w-4" /></IconBtn>
                          <IconBtn onClick={() => setEditingId(null)}><X className="h-4 w-4" /></IconBtn>
                        </>
                      ) : (
                        <>
                          <IconBtn onClick={() => { setEditingId(ev.id); setEditValue(ev.name); }}><Pencil className="h-4 w-4" /></IconBtn>
                          <IconBtn onClick={() => remove(ev.id)} danger><Trash2 className="h-4 w-4" /></IconBtn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
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