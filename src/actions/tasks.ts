"use server";

import { createServerServiceClient } from "@/lib/supabase";
import { getUserContext } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { createTaskSchema, toggleTaskSchema } from "@/lib/validators";
import { sanitizeHtml } from "@/lib/security";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  try {
    const { orgId } = await getUserContext("tasks:read");

    const supabase = createServerServiceClient();

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching tasks", error, { orgId });
      return [];
    }

    return tasks || [];
  } catch (err: any) {
    logger.error("getTasks failed", err);
    throw new Error(err.message || "Failed to fetch tasks");
  }
}

export async function createTask(text: string, priority: "High" | "Medium" | "Low" = "Medium", lead?: string) {
  try {
    const { userId, orgId } = await getUserContext("tasks:write");

    const rate = checkRateLimit(`tasks:create:${userId}`, 30, 60000);
    if (!rate.allowed) {
      throw new Error("Rate limit exceeded for task creation");
    }

    const validated = createTaskSchema.parse({ text, priority, lead });

    const newTask = {
      org_id: orgId,
      user_id: userId,
      text: sanitizeHtml(validated.text),
      priority: validated.priority,
      lead: validated.lead ? sanitizeHtml(validated.lead) : null,
      done: false,
    };

    const supabase = createServerServiceClient();

    const { data: task, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .single();

    if (error) {
      logger.error("Error inserting task", error, { orgId });
      throw new Error("Failed to create task");
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (err: any) {
    logger.error("createTask failed", err);
    throw new Error(err.message || "Failed to create task");
  }
}

export async function toggleTask(taskId: string) {
  try {
    const { orgId } = await getUserContext("tasks:write");

    const validated = toggleTaskSchema.parse({ taskId });

    const supabase = createServerServiceClient();

    const { data: task } = await supabase
      .from("tasks")
      .select("done")
      .eq("id", validated.taskId)
      .eq("org_id", orgId)
      .single();

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const { error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", validated.taskId)
      .eq("org_id", orgId);

    if (error) {
      logger.error("Error updating task", error, { taskId, orgId });
      throw new Error("Failed to update task");
    }

    revalidatePath("/tasks");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    logger.error("toggleTask failed", err);
    throw new Error(err.message || "Failed to toggle task");
  }
}
