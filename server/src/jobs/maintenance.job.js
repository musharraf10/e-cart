import cron from "node-cron";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Order } from "../models/order.model.js";

const OLD_NOTIFICATION_DAYS = Number(process.env.NOTIFICATION_RETENTION_DAYS || 90);
const UNPAID_ORDER_HOURS = Number(process.env.AUTO_CANCEL_UNPAID_HOURS || 24);

async function cleanupExpiredTokens() {
  await User.updateMany(
    {
      $or: [
        { verifyTokenExpiry: { $lt: new Date() } },
        { passwordResetTokenExpiry: { $lt: new Date() } },
      ],
    },
    {
      $unset: {
        verifyTokenHash: "",
        verifyTokenExpiry: "",
        passwordResetTokenHash: "",
        passwordResetTokenExpiry: "",
      },
    },
  );
}

async function cleanupOldNotifications() {
  const cutoff = new Date(Date.now() - OLD_NOTIFICATION_DAYS * 24 * 60 * 60 * 1000);
  await Notification.deleteMany({ createdAt: { $lt: cutoff } });
}

async function cancelStaleUnpaidOrders() {
  const cutoff = new Date(Date.now() - UNPAID_ORDER_HOURS * 60 * 60 * 1000);
  await Order.updateMany(
    {
      paymentMethod: "online",
      paymentStatus: "pending",
      status: "pending",
      createdAt: { $lt: cutoff },
    },
    {
      $set: {
        status: "cancelled",
        paymentStatus: "failed",
      },
    },
  );
}

async function runMaintenanceJobs() {
  await cleanupExpiredTokens();
  await cleanupOldNotifications();
  await cancelStaleUnpaidOrders();
}

export function startMaintenanceJobs() {
  cron.schedule("0 0 * * *", async () => {
    try {
      await runMaintenanceJobs();
      console.log("[cron] maintenance jobs completed");
    } catch (error) {
      console.error("[cron] maintenance jobs failed", error);
    }
  });

  if (process.env.CRON_RUN_ON_START === "true") {
    runMaintenanceJobs().catch((error) => {
      console.error("[cron] startup maintenance failed", error);
    });
  }
}
