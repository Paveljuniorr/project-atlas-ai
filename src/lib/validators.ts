import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const createLeadSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100).trim(),
  last_name: z.string().max(100).trim().optional(),
  email: z.string().email("Invalid email address").trim(),
  company_name: z.string().max(150).trim().optional(),
  stage_id: z.string().default("new"),
  source: z.string().default("manual"),
});

export const updateLeadStageSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  newStageId: z.string().min(1, "Stage ID is required"),
});

export const generateAiDraftSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  triggerMessageId: z.string().optional(),
});

export const createTaskSchema = z.object({
  text: z.string().min(1, "Task description is required").max(300).trim(),
  priority: z.enum(["High", "Medium", "Low"]).default("Medium"),
  lead: z.string().max(150).optional(),
  dueDate: z.string().max(50).optional(),
});

export const toggleTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
});

export const createMeetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required").max(200).trim(),
  lead: z.string().min(1, "Lead name is required").max(100).trim(),
  company: z.string().max(150).trim().optional(),
  time: z.string().min(1, "Time is required"),
  date: z.string().min(1, "Date is required"),
  platform: z.enum(["Google Meet", "Zoom", "Microsoft Teams"]).default("Google Meet"),
  link: z.string().url("Invalid meeting link").optional(),
});

export const twilioWebhookSchema = z.object({
  From: z.string().min(1, "Missing From parameter"),
  Body: z.string().min(1, "Missing Body parameter"),
  MessageSid: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  tone: z.enum(["professional", "friendly", "persuasive", "concise"]).default("professional"),
  autoReply: z.boolean().default(false),
});
