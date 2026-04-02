import { HomeSection } from "../models/homeSection.model.js";

const DEFAULT_HOME_SECTIONS = [
  { key: "hero", label: "Hero", isActive: true, order: 1 },
  { key: "categories", label: "Categories", isActive: true, order: 2 },
  { key: "products", label: "Featured Products", isActive: true, order: 3 },
  { key: "newCollection", label: "New Collection", isActive: true, order: 4 },
  { key: "reviews", label: "Reviews", isActive: true, order: 5 },
];

export async function ensureHomeSections() {
  const count = await HomeSection.countDocuments();
  if (count > 0) return;
  await HomeSection.insertMany(DEFAULT_HOME_SECTIONS);
}

export async function getHomeSections(req, res) {
  await ensureHomeSections();
  const sections = await HomeSection.find().sort({ order: 1, key: 1 }).lean();
  res.json(sections);
}

export { DEFAULT_HOME_SECTIONS };
