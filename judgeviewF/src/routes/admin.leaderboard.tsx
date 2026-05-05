import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppLayout";
import { Leaderboard } from "@/components/Leaderboard";

export const Route = createFileRoute("/admin/leaderboard")({
  component: () => (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Leaderboard" subtitle="Live rankings — refreshed every 5 seconds." />
      <Leaderboard />
    </div>
  ),
});