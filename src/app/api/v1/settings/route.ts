import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from "@/server/services/settings-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  aiSettings: z
    .object({
      tone: z.enum(["professional", "friendly", "persuasive", "concise"]).optional(),
      humanInTheLoop: z.boolean().optional(),
      autoReply: z.boolean().optional(),
      bookingPrompt: z.string().optional(),
    })
    .optional(),
  pipelineStages: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        order: z.number(),
        isTerminal: z.boolean().optional(),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const ctx = await getUserContext("settings:read");
    const settings = await getOrganizationSettings(ctx.orgId);
    return apiSuccess(settings);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getUserContext("settings:write");
    const body = settingsSchema.parse(await req.json());
    const updated = await updateOrganizationSettings(ctx, body);
    return apiSuccess(updated);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
