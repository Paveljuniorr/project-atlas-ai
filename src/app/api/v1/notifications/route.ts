import { NextRequest } from "next/server";
import { getUserContext } from "@/lib/rbac";
import {
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/server/services/notification-service";
import { apiSuccess, mapErrorToResponse } from "@/server/api/response";

export async function GET() {
  try {
    const ctx = await getUserContext();
    const notifications = await listNotifications(ctx);
    return apiSuccess(notifications);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await getUserContext();
    const body = await req.json();

    if (body.all) {
      const result = await markAllNotificationsAsRead(ctx);
      return apiSuccess(result);
    }

    if (!body.notificationId) {
      throw new Error("VALIDATION: notificationId is required");
    }

    const updated = await markNotificationAsRead(ctx, body.notificationId);
    return apiSuccess(updated);
  } catch (err) {
    return mapErrorToResponse(err);
  }
}
