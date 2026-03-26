import jwt from "jsonwebtoken";

export function generateAccessToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ id: userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
}

export function generateToken(userId) {
  return generateAccessToken(userId);
}
