import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getAuth, roleHome } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const a = getAuth();
    navigate({ to: a ? roleHome[a.role] : "/login" });
  }, [navigate]);
  return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Redirecting…</div>;
}
