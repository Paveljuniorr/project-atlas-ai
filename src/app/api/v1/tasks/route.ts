import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import { listTasks, createTaskRecord, toggleTaskStatus, deleteTaskRecord } from "@/server/services/task-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";
import { z } from "zod";

const taskSchema = z.object({
  text: z.string().min(1).max(300),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  lead: z.string().optional(),
  leadId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await getUserContext("tasks:read");
    const { searchParams } = new URL(req.url);
    const doneParam = searchParams.get("done");
    const priority = searchParams.get("priority") || undefined;

    const done = doneParam === "true" ? true : doneParam === "false" ? false : undefined;
    const tasks = await listTasks(ctx.orgId, { done, priority });
    return apiSuccess(tasks);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext("tasks:write");
    const body = taskSchema.parse(await req.json());
    const task = await createTaskRecord(ctx, body);
    return apiSuccess(task, 201);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getUserContext("tasks:write");
    const { taskId } = await req.json();
    if (!taskId) throw new Error("VALIDATION: taskId is required");
    const task = await toggleTaskStatus(ctx, taskId);
    return apiSuccess(task);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getUserContext("tasks:write");
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("id");
    if (!taskId) throw new Error("VALIDATION: Task ID is required");
    await deleteTaskRecord(ctx, taskId);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
