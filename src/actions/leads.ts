"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { createLeadSchema, updateLeadStageSchema } from "@/lib/validators";
import { sanitizeHtml } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  try {
    const { orgId } = await getUserContext("leads:read");

    const rate = checkRateLimit(`leads:read:${orgId}`, 60, 60000);
    if (!rate.allowed) {
      throw new Error("Rate limit exceeded. Please wait a minute before retrying.");
    }

    const supabase = createServerServiceClient();

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching leads from Supabase", error, { orgId });
      return [];
    }

    return leads || [];
  } catch (err: any) {
    logger.error("getLeads failed", err);
    throw new Error(err.message || "Failed to fetch leads");
  }
}

export async function createLead(formData: FormData) {
  try {
    const { userId, orgId } = await getUserContext("leads:create");

    const rate = checkRateLimit(`leads:create:${userId}`, 20, 60000);
    if (!rate.allowed) {
      throw new Error("Rate limit exceeded for lead creation.");
    }

    const rawInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string || undefined,
      email: formData.get("email") as string,
      company_name: formData.get("company_name") as string || undefined,
      stage_id: (formData.get("stage_id") as string) || "new",
      source: (formData.get("source") as string) || "manual",
    };

    const validated = createLeadSchema.parse(rawInput);

    const newLead = {
      org_id: orgId,
      first_name: sanitizeHtml(validated.first_name),
      last_name: validated.last_name ? sanitizeHtml(validated.last_name) : null,
      email: sanitizeHtml(validated.email),
      company_name: validated.company_name ? sanitizeHtml(validated.company_name) : null,
      stage_id: sanitizeHtml(validated.stage_id),
      source: sanitizeHtml(validated.source),
    };

    const supabase = createServerServiceClient();

    const { error } = await supabase
      .from("leads")
      .insert([newLead]);

    if (error) {
      logger.error("Database insert lead failed", error, { orgId });
      throw new Error("Failed to save lead record");
    }

    revalidatePath("/leads");
    return { success: true };
  } catch (err: any) {
    logger.error("createLead failed", err);
    throw new Error(err.message || "Failed to create lead");
  }
}

export async function updateLeadStage(leadId: string, newStageId: string) {
  try {
    const { userId, orgId } = await getUserContext("leads:update");

    const validated = updateLeadStageSchema.parse({ leadId, newStageId });

    const supabase = createServerServiceClient();

    const { error } = await supabase
      .from("leads")
      .update({ stage_id: sanitizeHtml(validated.newStageId) })
      .eq("id", validated.leadId)
      .eq("org_id", orgId);

    if (error) {
      logger.error("Database update lead stage failed", error, { leadId, orgId });
      throw new Error("Failed to update lead stage");
    }

    revalidatePath("/leads");
    return { success: true };
  } catch (err: any) {
    logger.error("updateLeadStage failed", err);
    throw new Error(err.message || "Failed to update lead");
  }
}
