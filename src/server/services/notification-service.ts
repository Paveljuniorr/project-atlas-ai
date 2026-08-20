import { createServerServiceClient } from "@/server/db/client";
import type { UserContext } from "@/server/auth/context";

export async function listNotifications(ctx: UserContext) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", ctx.orgId)
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error("Failed to fetch notifications");
  return data ?? [];
}

export async function createNotification(params: {
  orgId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  entity?: Record<string, unknown>;
}) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      org_id: params.orgId,
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      action_url: params.actionUrl ?? null,
      entity: params.entity ?? {},
      is_read: false,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create notification");
  return data;
}

export async function markNotificationAsRead(ctx: UserContext, notificationId: string) {
  const supabase = createServerServiceClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("org_id", ctx.orgId)
    .eq("user_id", ctx.userId)
    .select()
    .single();

  if (error) throw new Error("Failed to mark notification as read");
  return data;
}

export async function markAllNotificationsAsRead(ctx: UserContext) {
  const supabase = createServerServiceClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("org_id", ctx.orgId)
    .eq("user_id", ctx.userId)
    .eq("is_read", false);

  if (error) throw new Error("Failed to mark notifications as read");
  return { success: true };
}
