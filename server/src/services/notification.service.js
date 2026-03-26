import { Notification } from "../models/notification.model.js";

export async function createNotification({ userId, title, message, type = "system", link = "" }) {
  if (!userId || !title || !message) return null;

  return Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });
}

export async function markNotificationRead({ userId, notificationId }) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true } },
    { new: true },
  );
}
