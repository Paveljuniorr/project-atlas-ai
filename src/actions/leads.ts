"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Use the active organization, or fallback to user's personal context if no org is active
  // In a real multi-tenant app, we'd ensure orgId is always present.
  const effectiveOrgId = orgId || "default-org-id"; // Placeholder if Clerk orgs aren't strictly enforced yet

  const supabase = createServerServiceClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    // In production, uncomment the next line when Clerk orgs are mapped to Supabase organizations
    // .eq("org_id", effectiveOrgId) 
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return leads;
}

export async function createLead(formData: FormData) {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const effectiveOrgId = orgId || "default-org-id";
  const supabase = createServerServiceClient();

  const newLead = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    company_name: formData.get("company_name") as string,
    stage_id: "new",
    source: "manual",
    // org_id: effectiveOrgId // Uncomment when orgs are fully synced
  };

  const { error } = await supabase
    .from("leads")
    .insert([newLead]);

  if (error) {
    console.error("Error creating lead:", error);
    throw new Error("Failed to create lead");
  }

  revalidatePath("/leads");
  return { success: true };
}

export async function updateLeadStage(leadId: string, newStageId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createServerServiceClient();

  const { error } = await supabase
    .from("leads")
    .update({ stage_id: newStageId })
    .eq("id", leadId);

  if (error) {
    console.error("Error updating lead stage:", error);
    throw new Error("Failed to update lead");
  }

  revalidatePath("/leads");
  return { success: true };
}
