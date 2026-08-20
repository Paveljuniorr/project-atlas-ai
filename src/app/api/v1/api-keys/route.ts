import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import {
  listApiKeys,
  createApiKeyRecord,
  revokeApiKey,
} from "@/server/services/api-key-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default(["leads:read", "leads:create"]),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export async function GET() {
  try {
    const ctx = await getUserContext("integrations:manage");
    const keys = await listApiKeys(ctx.orgId);
    return apiSuccess(keys);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("integrations:manage");
    const body = createKeySchema.parse(await req.json());
    const result = await createApiKeyRecord(ctx, body);
    return apiSuccess(result, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getUserContext("integrations:manage");
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");
    if (!keyId) throw new Error("VALIDATION: Key ID is required");
    const result = await revokeApiKey(ctx, keyId);
    return apiSuccess(result);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
