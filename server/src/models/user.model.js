import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    firebaseUid: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      default: null,
      required: function requiredPassword() {
        return this.authProvider === "local";
      },
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verifyTokenHash: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetTokenExpiry: { type: Date, default: null },
    mobileNumber: String,
    isMobileVerified: { type: Boolean, default: false },
    avatar: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    savedCards: [
      {
        last4: {
          type: String,
          trim: true,
          minlength: 4,
          maxlength: 4,
        },
        brand: {
          type: String,
          trim: true,
          maxlength: 30,
        },
        expiry: {
          type: String,
          trim: true,
          maxlength: 5,
        },
        tokenId: {
          type: String,
          trim: true,
          maxlength: 120,
        },
      },
    ],
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    refreshTokenHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
