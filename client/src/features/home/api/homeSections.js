import api from "../../../api/client.js";

const FALLBACK_SECTIONS = [
  { key: "hero", isActive: true, order: 1 },
  { key: "categories", isActive: true, order: 2 },
  { key: "products", isActive: true, order: 3 },
  { key: "newCollection", isActive: true, order: 4 },
  { key: "reviews", isActive: true, order: 5 },
];

export async function fetchHomeSections() {
  try {
    const { data } = await api.get("/home/sections");
    if (!Array.isArray(data) || !data.length) return FALLBACK_SECTIONS;
    return data;
  } catch {
    return FALLBACK_SECTIONS;
  }
}
