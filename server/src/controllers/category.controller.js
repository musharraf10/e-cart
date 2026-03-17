import { Category } from "../models/category.model.js";

export async function listCategories(req, res) {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json(categories);
}
