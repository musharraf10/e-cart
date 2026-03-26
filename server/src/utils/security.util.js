import crypto from "crypto";

export function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function tokenExpiry(minutes = 30) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
