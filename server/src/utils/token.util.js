import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "45m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

function getAccessSecret() {
  return process.env.JWT_SECRET;
}

function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
}

export function generateAccessToken(userId) {
  return jwt.sign({ id: userId, type: "access" }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ id: userId, type: "refresh" }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, getRefreshSecret());
  if (decoded?.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  return decoded;
}

export function generateToken(userId) {
  return generateAccessToken(userId);
}
