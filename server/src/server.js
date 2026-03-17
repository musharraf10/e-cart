import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`NoorFit API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
