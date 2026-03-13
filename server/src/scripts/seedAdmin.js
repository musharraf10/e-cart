import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/user.model.js";

dotenv.config();

async function seedAdmin() {
  await connectDB();

  const email = "admin@noorfit.com";
  const password = "admin123";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = existing.name || "NoorFit Admin";
    existing.password = password;
    existing.role = "admin";
    await existing.save();
    console.log("Admin user updated:", email);
  } else {
    await User.create({
      name: "NoorFit Admin",
      email,
      password,
      role: "admin",
    });
    console.log("Admin user created:", email);
  }

  await mongoose.connection.close();
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed admin user", error);
    process.exit(1);
  });
