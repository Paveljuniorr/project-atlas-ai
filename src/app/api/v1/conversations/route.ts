import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { createServerServiceClient } from "@/server/db/client";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getUserContext("inbox:read");
    const supabase = createServerServiceClient();
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const status = searchParams.get("status") || "open";

    let query = supabase
      .from("conversations")
      .select("*, lead:leads(*), messages(*)")
      .eq("org_id", ctx.orgId)
      .order("updated_at", { ascending: false });

    if (channel && channel !== "all") {
      query = query.eq("channel", channel);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(50);
    if (error) throw new Error("Failed to fetch conversations");

    return apiSuccess(data ?? []);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
