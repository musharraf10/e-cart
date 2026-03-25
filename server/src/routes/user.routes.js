import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getUserProfile,
  listSavedCards,
  updateUserProfile,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.get("/saved-cards", listSavedCards);

router.get("/addresses", listAddresses);
router.post("/addresses", createAddress);
router.put("/addresses/:id", updateAddress);
router.delete("/addresses/:id", deleteAddress);

router.get("/wishlist", getWishlist);
router.post("/wishlist/:productId", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

router.put("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);

export default router;
