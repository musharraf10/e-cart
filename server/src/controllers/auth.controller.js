import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.util.js";
import { getFirebaseAdminAuth } from "../config/firebase-admin.js";

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

export async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ name, email, password, authProvider: "local" });

  res.status(201).json(await buildAuthResponse(user, res));
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

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
    });
  } else {
    user.avatar = user.avatar || avatar;
    user.firebaseUid = user.firebaseUid || decodedToken.uid;
    await user.save();
  }

  res.json(await buildAuthResponse(user, res));
}

export async function refreshAccessToken(req, res) {
  const cookies = parseCookies(req);
  const refreshToken = cookies[refreshCookieName];

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokenHash) {
    res.status(401);
    throw new Error("Refresh token not recognized");
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!matches) {
    res.status(401);
    throw new Error("Refresh token mismatch");
  }

  const token = generateAccessToken(user._id);
  res.json({ token });
}

export async function logout(req, res) {
  const cookies = parseCookies(req);
  const refreshToken = cookies[refreshCookieName];

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
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
