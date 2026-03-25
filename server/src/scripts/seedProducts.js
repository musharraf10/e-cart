import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";

dotenv.config();

// ---------------- CONFIG ----------------
const sizes = ["S", "M", "L", "XL"];
const colors = ["Black", "White", "Olive", "Beige", "Navy", "Gray"];

// 20 categories
const categoryList = [
  "T-Shirts",
  "Hoodies",
  "Jeans",
  "Jackets",
  "Shirts",
  "Shorts",
  "Track Pants",
  "Sweatshirts",
  "Cargo Pants",
  "Denim Jackets",
  "Polo T-Shirts",
  "Oversized Tees",
  "Activewear",
  "Gym Wear",
  "Ethnic Wear",
  "Winter Wear",
  "Summer Wear",
  "Formal Wear",
  "Casual Wear",
  "Accessories",
];

// ---------------- CREATE CATEGORIES ----------------
const seedCategories = async () => {
  const categories = [];

  for (let i = 0; i < categoryList.length; i++) {
    const name = categoryList[i];

    let category = await Category.findOne({ name });

    if (!category) {
      category = await Category.create({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        image: `https://picsum.photos/200?random=${i}`,
        isActive: true,
      });
    }

    categories.push(category);
  }

  console.log(`✅ ${categories.length} Categories Ready`);
  return categories;
};

// ---------------- GENERATE PRODUCTS ----------------
const generateProducts = (count, categories) => {
  const products = [];

  const getRandomCategory = () =>
    categories[Math.floor(Math.random() * categories.length)]._id;

  for (let i = 1; i <= count; i++) {
    const variants = [];

    sizes.forEach((size) => {
      colors.forEach((color) => {
        variants.push({
          size,
          color,
          stock: Math.floor(Math.random() * 20) + 5,
          price: Math.floor(Math.random() * 500) + 999,
          sku: `NF-${i}-${size}-${color}`.toUpperCase(),
        });
      });
    });

    const colorImages = Object.fromEntries(
      colors.map((color, idx) => [
        color,
        [
          `https://picsum.photos/400/500?random=${i + idx}`,
          `https://picsum.photos/400/500?random=${i + idx + 50}`,
        ],
      ]),
    );

    products.push({
      name: `NoorFit Product ${i}`,
      slug: `noorfit-product-${i}`,
      description: "Premium quality clothing for everyday comfort.",
      price: 999,
      originalPrice: 1499,

      category: getRandomCategory(), // ✅ category assigned

      images: [`https://picsum.photos/400/500?random=${i}`],
      colorImages,

      variants,

      isVisible: true,
      isNewDrop: i % 5 === 0,
      isFeatured: i % 7 === 0,
    });
  }

  return products;
};

// ---------------- MAIN SEED FUNCTION ----------------
const seed = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/noorfit");
    console.log("✅ DB Connected");

    const categories = await seedCategories();

    const products = generateProducts(150, categories);

    await Product.deleteMany(); // optional reset
    await Product.insertMany(products);

    console.log("🔥 150 Products Inserted Successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seed();
