import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import {
  listKnowledgeBase,
  createKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
} from "@/server/services/knowledge-base-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const createKbSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

const updateKbSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const ctx = await getUserContext("settings:read");
    const articles = await listKnowledgeBase(ctx.orgId);
    return apiSuccess(articles);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("settings:write");
    const body = createKbSchema.parse(await req.json());
    const article = await createKnowledgeBaseEntry(ctx, body);
    return apiSuccess(article, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getUserContext("settings:write");
    const body = updateKbSchema.parse(await req.json());
    const updated = await updateKnowledgeBaseEntry(ctx, body.id, body);
    return apiSuccess(updated);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getUserContext("settings:write");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new Error("VALIDATION: Article ID is required");
    const result = await deleteKnowledgeBaseEntry(ctx, id);
    return apiSuccess(result);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
