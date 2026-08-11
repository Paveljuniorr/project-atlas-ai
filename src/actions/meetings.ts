"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { createMeetingSchema } from "@/lib/validators";
import { sanitizeHtml } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getMeetings() {
  try {
    const { orgId } = await getUserContext("meetings:read");

    const supabase = createServerServiceClient();

    const { data: meetings, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching meetings", error, { orgId });
      return [];
    }

    return meetings || [];
  } catch (err: any) {
    logger.error("getMeetings failed", err);
    throw new Error(err.message || "Failed to fetch meetings");
  }
}

export async function createMeeting(data: {
  title: string;
  lead: string;
  company?: string;
  time: string;
  date: string;
  platform?: "Google Meet" | "Zoom" | "Microsoft Teams";
  link?: string;
}) {
  try {
    const { userId, orgId } = await getUserContext("meetings:write");

    const rate = checkRateLimit(`meetings:create:${userId}`, 20, 60000);
    if (!rate.allowed) {
      throw new Error("Rate limit exceeded for meeting creation");
    }

    const validated = createMeetingSchema.parse(data);

    const newMeeting = {
      org_id: orgId,
      user_id: userId,
      title: sanitizeHtml(validated.title),
      lead: sanitizeHtml(validated.lead),
      company: validated.company ? sanitizeHtml(validated.company) : null,
      time: sanitizeHtml(validated.time),
      date: sanitizeHtml(validated.date),
      platform: validated.platform,
      link: validated.link || null,
      status: "Upcoming",
    };

    const supabase = createServerServiceClient();

    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert([newMeeting])
      .select()
      .single();

    if (error) {
      logger.error("Error creating meeting", error, { orgId });
      throw new Error("Failed to schedule meeting");
    }

    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return { success: true, meeting };
  } catch (err: any) {
    logger.error("createMeeting failed", err);
    throw new Error(err.message || "Failed to schedule meeting");
  }
}
