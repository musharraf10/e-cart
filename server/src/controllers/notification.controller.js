import { Notification } from "../models/notification.model.js";
import { markNotificationRead } from "../services/notification.service.js";

export async function getMyNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  res.json({ notifications, unreadCount });
}

export async function markAsRead(req, res) {
  const notification = await markNotificationRead({
    userId: req.user._id,
    notificationId: req.params.id,
  });

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  res.json(notification);
}
