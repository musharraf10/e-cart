import { User } from "../models/user.model.js";
import { generateToken } from "../utils/token.util.js";
import { getFirebaseAdminAuth } from "../config/firebase-admin.js";

function formatAuthResponse(user) {
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
    },
    token: generateToken(user._id),
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

  res.status(201).json(formatAuthResponse(user));
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

  res.json(formatAuthResponse(user));
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

  res.json(formatAuthResponse(user));
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
