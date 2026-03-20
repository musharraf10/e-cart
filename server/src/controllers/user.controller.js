import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js";
import { Order } from "../models/order.model.js";

export async function getUserProfile(req, res) {
  res.json(req.user);
}

export async function updateUserProfile(req, res) {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, email, mobileNumber, dateOfBirth, gender, avatar } = req.body;

  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;

  if (mobileNumber !== undefined && mobileNumber !== user.mobileNumber) {
    user.mobileNumber = mobileNumber;
    user.isMobileVerified = false;
  }

  if (dateOfBirth !== undefined) {
    user.dateOfBirth = dateOfBirth || undefined;
  }

  if (gender !== undefined) {
    user.gender = gender || undefined;
  }

  if (avatar !== undefined) {
    user.avatar = avatar || "";
  }

  await user.save();

  const safeUser = await User.findById(user._id).select("-password");
  res.json(safeUser);
}

export async function listAddresses(req, res) {
  const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json(addresses);
}

export async function createAddress(req, res) {
  const payload = { ...req.body, userId: req.user._id };

  if (payload.isDefault) {
    await Address.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
  }

  const hasAny = await Address.countDocuments({ userId: req.user._id });
  if (!hasAny) {
    payload.isDefault = true;
  }

  const address = await Address.create(payload);
  res.status(201).json(address);
}

export async function updateAddress(req, res) {
  const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  if (req.body.isDefault) {
    await Address.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
  }

  Object.assign(address, req.body);
  await address.save();
  res.json(address);
}

export async function deleteAddress(req, res) {
  const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  if (address.isDefault) {
    const fallback = await Address.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (fallback) {
      fallback.isDefault = true;
      await fallback.save();
    }
  }

  res.json({ message: "Address deleted" });
}

export async function getWishlist(req, res) {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json(user?.wishlist || []);
}

export async function addToWishlist(req, res) {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  if (!user.wishlist.includes(productId) && !user.wishlist.some((id) => String(id) === productId)) {
    user.wishlist.push(productId);
    await user.save();
  }

  const populated = await User.findById(req.user._id).populate("wishlist");
  res.json(populated.wishlist);
}

export async function removeFromWishlist(req, res) {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  user.wishlist = user.wishlist.filter((id) => String(id) !== productId);
  await user.save();

  const populated = await User.findById(req.user._id).populate("wishlist");
  res.json(populated.wishlist);
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated" });
}

export async function deleteAccount(req, res) {
  await Address.deleteMany({ userId: req.user._id });
  await Order.deleteMany({ user: req.user._id });
  await User.findByIdAndDelete(req.user._id);

  res.json({ message: "Account deleted" });
}
