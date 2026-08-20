import { getDashboardMetrics } from "@/server/services/dashboard-service";
import { getUserContext } from "@/lib/rbac";
import { DashboardClient } from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let metrics = null;
  let error: string | null = null;

  try {
    const ctx = await getUserContext("analytics:read");
    metrics = await getDashboardMetrics(ctx.orgId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load dashboard";
  }

  return <DashboardClient metrics={metrics as Parameters<typeof DashboardClient>[0]["metrics"]} error={error} />;
}
