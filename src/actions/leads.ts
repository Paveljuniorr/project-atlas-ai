"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  const { userId } = await getAuthSession();

  const supabase = createServerServiceClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return leads;
}

export async function createLead(formData: FormData) {
  const { userId } = await getAuthSession();

  const supabase = createServerServiceClient();

  const newLead = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: formData.get("email") as string,
    company_name: formData.get("company_name") as string,
    stage_id: "new",
    source: "manual",
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
  const { userId } = await getAuthSession();

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
