import { useEffect, useState } from "react";

export type Role = "admin" | "judge" | "team";

export interface AuthUser {
  email: string;
  role: Role;
  token: string;
  name: string;
}

const KEY = "jd_auth";

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuth(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("jd-auth-change"));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("jd-auth-change"));
}

export function useAuth() {
  const [auth, setState] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setState(getAuth());
    setReady(true);
    const handler = () => setState(getAuth());
    window.addEventListener("jd-auth-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("jd-auth-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return { auth, ready };
}

export const roleHome: Record<Role, string> = {
  admin: "/admin/events",
  judge: "/judge/score",
  team: "/team/scores",
};