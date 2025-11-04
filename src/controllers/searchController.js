const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const Product = require("../models/Product");

exports.searchAll = async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) {
      return res.status(200).json({
        data: { categories: [], subcategories: [], products: [] },
      });
    }

    const regex = new RegExp(query, "i");

    // Helper: weighted search
    const weightedSearch = (Model, extraConditions = {}) =>
      Model.aggregate([
        { $match: { ...extraConditions, name: regex } },
        {
          $addFields: {
            relevance: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $toLower: "$name" }, query.toLowerCase()] }, then: 3 }, // exact match
                  { case: { $regexMatch: { input: "$name", regex: new RegExp(`^${query}`, "i") } }, then: 2 }, // starts with
                  { case: { $regexMatch: { input: "$name", regex: new RegExp(query, "i") } }, then: 1 }, // contains
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { relevance: -1, name: 1 } },
        { $limit: 10 },
      ]);

    const [categories, subcategories, products] = await Promise.all([
      weightedSearch(Category),
      weightedSearch(Subcategory),
      weightedSearch(Product),
    ]);

    res.status(200).json({
      success: true,
      data: { categories, subcategories, products },
    });
  } catch (error) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({ success: false, message: "Search failed", error: error.message });
  }
};
