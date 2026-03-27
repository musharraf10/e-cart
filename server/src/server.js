import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startMaintenanceJobs } from "./jobs/maintenance.job.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function start() {
  try {
    await connectDB();
    startMaintenanceJobs();
    server.listen(PORT, () => {
      console.log(`NoorFit API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
