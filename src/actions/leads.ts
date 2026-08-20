"use server";

import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { createLeadSchema, updateLeadStageSchema } from "@/lib/validators";
import { sanitizeHtml } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { listLeads, createLeadRecord, updateLeadRecord } from "@/server/services/lead-service";

export async function getLeads() {
  try {
    const ctx = await getUserContext("leads:read");
    const rate = checkRateLimit(`leads:read:${ctx.orgId}`, 60, 60000);
    if (!rate.allowed) throw new Error("Rate limit exceeded. Please wait a minute before retrying.");

    const { leads } = await listLeads(ctx.orgId, { limit: 100 });
    return leads;
  } catch (err: unknown) {
    logger.error("getLeads failed", err);
    throw new Error(err instanceof Error ? err.message : "Failed to fetch leads");
  }
}

export async function createLead(formData: FormData) {
  try {
    const ctx = await getUserContext("leads:create");
    const rate = checkRateLimit(`leads:create:${ctx.userId}`, 20, 60000);
    if (!rate.allowed) throw new Error("Rate limit exceeded for lead creation.");

    const rawInput = {
      first_name: formData.get("first_name") as string,
      last_name: (formData.get("last_name") as string) || undefined,
      email: formData.get("email") as string,
      company_name: (formData.get("company_name") as string) || undefined,
      stage_id: (formData.get("stage_id") as string) || "new",
      source: (formData.get("source") as string) || "manual",
    };

    const validated = createLeadSchema.parse(rawInput);
    await createLeadRecord(ctx, {
      first_name: sanitizeHtml(validated.first_name),
      last_name: validated.last_name ? sanitizeHtml(validated.last_name) : undefined,
      email: sanitizeHtml(validated.email),
      company_name: validated.company_name ? sanitizeHtml(validated.company_name) : undefined,
      stage_id: sanitizeHtml(validated.stage_id),
      source: sanitizeHtml(validated.source),
    });

    revalidatePath("/leads");
    return { success: true };
  } catch (err: unknown) {
    logger.error("createLead failed", err);
    throw new Error(err instanceof Error ? err.message : "Failed to create lead");
  }
}

export async function updateLeadStage(leadId: string, newStageId: string) {
  try {
    const ctx = await getUserContext("leads:update");
    const validated = updateLeadStageSchema.parse({ leadId, newStageId });
    await updateLeadRecord(ctx, validated.leadId, { stage_id: sanitizeHtml(validated.newStageId) });
    revalidatePath("/leads");
    return { success: true };
  } catch (err: unknown) {
    logger.error("updateLeadStage failed", err);
    throw new Error(err instanceof Error ? err.message : "Failed to update lead");
  }
}
