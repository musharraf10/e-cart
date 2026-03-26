import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.util.js";
import { getFirebaseAdminAuth } from "../config/firebase-admin.js";
import { generateRawToken, hashToken, tokenExpiry } from "../utils/security.util.js";
import { sendEmail } from "../utils/email.util.js";

const refreshCookieName = "noorfit_refresh";

function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};

  return header.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function setRefreshCookie(res, token) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const cookie = [
    `${refreshCookieName}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/api/auth",
    `Max-Age=${Math.floor(maxAge / 1000)}`,
  ];

  if (secure) cookie.push("Secure");
  res.setHeader("Set-Cookie", cookie.join("; "));
}

function clearRefreshCookie(res) {
  const secure = process.env.NODE_ENV === "production";
  const cookie = [`${refreshCookieName}=`, "HttpOnly", "SameSite=Lax", "Path=/api/auth", "Max-Age=0"];

  if (secure) cookie.push("Secure");
  res.setHeader("Set-Cookie", cookie.join("; "));
}

async function persistRefreshToken(user, refreshToken) {
  const salt = await bcrypt.genSalt(10);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
  await user.save();
}

async function invalidateUserRefreshToken(user) {
  if (!user?.refreshTokenHash) return;
  user.refreshTokenHash = null;
  await user.save();
}

function rejectRefreshRequest(res, message) {
  clearRefreshCookie(res);
  res.status(401);
  throw new Error(message);
}

async function buildAuthResponse(user, res) {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await persistRefreshToken(user, refreshToken);
  setRefreshCookie(res, refreshToken);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
    },
    token: accessToken,
  };
}

async function sendVerificationEmail(user, rawToken) {
  const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientBaseUrl}/verify-email?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your NoorFit account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Welcome to NoorFit, ${user.name}!</h2>
        <p>Please verify your email to activate your account.</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(user, rawToken) {
  const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientBaseUrl}/reset-password?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(user.email)}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your NoorFit password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Password reset request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link expires in 30 minutes.</p>
      </div>
    `,
  });
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  const normalizedEmail = String(email || "").toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const rawVerifyToken = generateRawToken();

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    authProvider: "local",
    isVerified: false,
    verifyTokenHash: hashToken(rawVerifyToken),
    verifyTokenExpiry: tokenExpiry(24 * 60),
  });

  await sendVerificationEmail(user, rawVerifyToken);

  res.status(201).json({
    message: "Registration successful. Please verify your email before login.",
  });
}

export async function verifyEmail(req, res) {
  const { token, email } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Verification token is required");
  }

  const user = await User.findOne({
    email: String(email || "").toLowerCase(),
    verifyTokenHash: hashToken(token),
    verifyTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Verification token is invalid or expired");
  }

  user.isVerified = true;
  user.verifyTokenHash = null;
  user.verifyTokenExpiry = null;
  await user.save();

  res.json({ message: "Email verified successfully. You can now log in." });
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  const normalizedEmail = String(email || "").toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || user.authProvider !== "local") {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const rawResetToken = generateRawToken();
  user.passwordResetTokenHash = hashToken(rawResetToken);
  user.passwordResetTokenExpiry = tokenExpiry(30);
  await user.save();

  await sendPasswordResetEmail(user, rawResetToken);

  return res.json({ message: "If that email exists, a reset link has been sent." });
}

export async function resetPassword(req, res) {
  const { token, email, password } = req.body;

  if (!token || !password || !email) {
    res.status(400);
    throw new Error("Email, token and password are required");
  }

  const user = await User.findOne({
    email: String(email).toLowerCase(),
    passwordResetTokenHash: hashToken(token),
    passwordResetTokenExpiry: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset token is invalid or expired");
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetTokenExpiry = null;
  await user.save();

  res.json({ message: "Password reset successful. Please log in with your new password." });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() });

  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    res.status(400);
    throw new Error("This account uses Google sign-in. Please continue with Google.");
  }

  if (!(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.authProvider === "local" && !user.isVerified) {
    res.status(403);
    throw new Error("Please verify your email before logging in.");
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error("Your account is blocked. Please contact support.");
  }

  res.json(await buildAuthResponse(user, res));
}

export async function googleLogin(req, res) {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    throw new Error("Firebase token is required");
  }

  const firebaseAuth = getFirebaseAdminAuth();
  const decodedToken = await firebaseAuth.verifyIdToken(token);

  if (decodedToken.firebase?.sign_in_provider !== "google.com") {
    res.status(401);
    throw new Error("Invalid sign-in provider");
  }

  const email = decodedToken.email?.toLowerCase();
  if (!email) {
    res.status(400);
    throw new Error("Google account does not provide a valid email");
  }

  const name = decodedToken.name || email.split("@")[0];
  const avatar = decodedToken.picture || "";

  let user = await User.findOne({ email });

  if (user?.isBlocked) {
    res.status(403);
    throw new Error("Your account is blocked. Please contact support.");
  }

  if (!user) {
    user = await User.create({
      name,
      email,
      avatar,
      password: null,
      role: "customer",
      authProvider: "google",
      firebaseUid: decodedToken.uid,
      isVerified: true,
    });
  } else {
    user.avatar = user.avatar || avatar;
    user.firebaseUid = user.firebaseUid || decodedToken.uid;
    if (!user.isVerified) user.isVerified = true;
    await user.save();
  }

  res.json(await buildAuthResponse(user, res));
}

export async function refreshAccessToken(req, res) {
  const cookies = parseCookies(req);
  const refreshToken = cookies[refreshCookieName];

  if (!refreshToken) {
    rejectRefreshRequest(res, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    rejectRefreshRequest(res, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokenHash) {
    rejectRefreshRequest(res, "Refresh token not recognized");
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    await invalidateUserRefreshToken(user);
    rejectRefreshRequest(res, "Refresh token mismatch");
  }

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  await persistRefreshToken(user, newRefreshToken);
  setRefreshCookie(res, newRefreshToken);

  res.json({ token: accessToken });
}

export async function logout(req, res) {
  const cookies = parseCookies(req);
  const refreshToken = cookies[refreshCookieName];

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      await invalidateUserRefreshToken(user);
    } catch {
      // best-effort logout
    }
  }

  clearRefreshCookie(res);
  res.json({ message: "Logged out" });
}

export async function getProfile(req, res) {
  res.json(req.user);
}

export async function updateProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, address } = req.body;
  if (name) user.name = name;
  if (address) user.address = address;

  await user.save();
  res.json(user);
}
