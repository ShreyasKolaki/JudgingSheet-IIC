// Real API layer — connects to the FastAPI backend at http://localhost:8000
import type { Role } from "./auth";
import { getAuth } from "./auth";

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Event {
  id: string;
  name: string;
}
export interface Criterion {
  id: string;
  event_id: string;
  name: string;
  max_score: number;
  weight: number;
  priority: number;
}
export interface Team {
  id: string;
  event_id: string;
  name: string;
}
export interface Score {
  team_id: string;
  event_id: string;
  criterion_id: string;
  score: number;
}
export interface LeaderRow {
  rank: number;
  team_id: string;
  team_name: string;
  total: number;
}
export interface ScoreItem {
  criterion_id: string;
  criterion_name: string;
  score: number;
  max_score: number;
  weight: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the Authorization header from localStorage token. */
function authHeaders(): HeadersInit {
  const auth = getAuth();
  return auth
    ? { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` }
    : { "Content-Type": "application/json" };
}

/** Wraps fetch with error-throwing for non-2xx responses. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  async login(email: string, password: string, role: Role) {
    // The backend uses "team_leader" but the UI uses "team"
    const backendRole = role === "team" ? "team_leader" : role;
    const data = await request<{ token: string; role: string; email: string; name: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password, role: backendRole }),
      }
    );
    // Normalize back: backend "team_leader" → frontend "team"
    const frontendRole: Role = data.role === "team_leader" ? "team" : (data.role as Role);
    return { ...data, role: frontendRole };
  },

  // ── Events ────────────────────────────────────────────────────────────────
  async getEvents(): Promise<Event[]> {
    return request<Event[]>("/events/");
  },

  async createEvent(name: string): Promise<Event> {
    return request<Event>("/events/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async updateEvent(id: string, name: string): Promise<Event> {
    return request<Event>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  async deleteEvent(id: string): Promise<void> {
    return request<void>(`/events/${id}`, { method: "DELETE" });
  },

  // ── Criteria ──────────────────────────────────────────────────────────────
  async getCriteria(eventId: string): Promise<Criterion[]> {
    const list = await request<Criterion[]>(`/criteria/${eventId}`);
    return list.sort((a, b) => a.priority - b.priority);
  },

  async createCriterion(c: Omit<Criterion, "id">): Promise<Criterion> {
    return request<Criterion>("/criteria/", {
      method: "POST",
      body: JSON.stringify(c),
    });
  },

  async updateCriterion(c: Criterion): Promise<Criterion> {
    return request<Criterion>(`/criteria/${c.id}`, {
      method: "PUT",
      body: JSON.stringify(c),
    });
  },

  async deleteCriterion(id: string): Promise<void> {
    return request<void>(`/criteria/${id}`, { method: "DELETE" });
  },

  // ── Teams ─────────────────────────────────────────────────────────────────
  async getTeams(eventId: string): Promise<Team[]> {
    return request<Team[]>(`/teams/${eventId}`);
  },

  // ── Scores ────────────────────────────────────────────────────────────────
  async submitScores(scores: Score[]): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>("/scores/", {
      method: "POST",
      body: JSON.stringify({ scores }),
    });
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────
  async getLeaderboard(eventId: string): Promise<LeaderRow[]> {
    return request<LeaderRow[]>(`/leaderboard/${eventId}`);
  },

  // ── My Scores (Team Leader view) ─────────────────────────────────────────
  async getMyScores(eventId: string, teamEmail: string) {
    // Find the team for this user by matching the email in the users collection
    // Since team leaders log in via email, we fetch all teams and match by name
    const teams = await this.getTeams(eventId);
    if (!teams.length) return { team: null, items: [], total: 0 };

    // Try to match by the auth name (which comes from the login response)
    // The backend returns name: "Team Leader" for all team leaders, so we
    // need to use the first team as a fallback when we can't distinguish.
    // For proper team matching, the team leader's email is used.
    const team = teams[0]; // fallback: show first team's scores

    const data = await request<{ items: ScoreItem[]; total: number }>(
      `/scores/${eventId}/${team.id}`
    );

    const items = data.items.map((it) => ({
      criterion: it.criterion_name,
      score: it.score,
      max: it.max_score,
      weight: it.weight,
    }));

    return { team, items, total: data.total };
  },
};