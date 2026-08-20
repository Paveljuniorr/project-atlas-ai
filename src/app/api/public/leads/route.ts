import { NextRequest } from "next/server";
import { createServerServiceClient } from "@/server/db/client";
import { createLeadRecord } from "@/server/services/lead-service";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const publicLeadSchema = z.object({
  orgSlug: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rate = checkRateLimit(`public:leads:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return mapErrorToResponse(new Error("RATE_LIMIT: Too many requests"));
    }

    const body = publicLeadSchema.parse(await req.json());

    if (body.website) {
      return apiSuccess({ accepted: true });
    }

    const supabase = createServerServiceClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", body.orgSlug)
      .maybeSingle();

    if (!org) {
      return mapErrorToResponse(new Error("NOT_FOUND: Organization not found"));
    }

    const nameParts = body.name.split(" ");
    const ctx = {
      userId: "public",
      email: body.email,
      orgId: org.id,
      role: "Owner" as const,
    };

    const lead = await createLeadRecord(ctx, {
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(" ") || undefined,
      email: body.email,
      phone: body.phone,
      company_name: body.company,
      source: "website",
      notes: body.message,
    });

    return apiSuccess({ leadId: lead.id }, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
