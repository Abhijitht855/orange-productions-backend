// controllers/searchController.js
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product"); // Product includes variants

// ✅ Unified search (Category, Subcategory, Product)
exports.searchAll = async (req, res) => {
  try {
    const query = req.query.query?.trim();

    if (!query) {
      return res.status(200).json({
        data: { categories: [], subcategories: [], products: [] },
      });
    }

    // Case-insensitive search
    const regex = new RegExp(query, "i");

    // Run all searches in parallel
    const [categories, subcategories, products] = await Promise.all([
      Category.find({ name: regex }).limit(10),
      Subcategory.find({ name: regex }).limit(10),
      Product.find({
        $or: [
          { name: regex },
          { "variants.name": regex }, // ✅ search inside product variants array
        ],
      }).limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: { categories, subcategories, products },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed", error: error.message });
  }
};
