// const Category = require("../models/Category");
// const Subcategory = require("../models/Subcategory");
// const Product = require("../models/Product");

// exports.searchAll = async (req, res) => {
//   try {
//     const query = req.query.query?.trim();
//     if (!query) {
//       return res.status(200).json({
//         data: { categories: [], subcategories: [], products: [] },
//       });
//     }

//     const regex = new RegExp(query, "i");

//     // Helper: weighted search
//     const weightedSearch = (Model, extraConditions = {}) =>
//       Model.aggregate([
//         { $match: { ...extraConditions, name: regex } },
//         {
//           $addFields: {
//             relevance: {
//               $switch: {
//                 branches: [
//                   { case: { $eq: [{ $toLower: "$name" }, query.toLowerCase()] }, then: 3 }, // exact match
//                   { case: { $regexMatch: { input: "$name", regex: new RegExp(`^${query}`, "i") } }, then: 2 }, // starts with
//                   { case: { $regexMatch: { input: "$name", regex: new RegExp(query, "i") } }, then: 1 }, // contains
//                 ],
//                 default: 0,
//               },
//             },
//           },
//         },
//         { $sort: { relevance: -1, name: 1 } },
//         { $limit: 10 },
//       ]);

//     const [categories, subcategories, products] = await Promise.all([
//       weightedSearch(Category),
//       weightedSearch(Subcategory),
//       weightedSearch(Product),
//     ]);

//     res.status(200).json({
//       success: true,
//       data: { categories, subcategories, products },
//     });
//   } catch (error) {
//     console.error("Search error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Search failed", error: error.message });
//   }
// };
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

    // 🧠 Weighted Search Helper
    const weightedSearch = (Model, extraMatch = {}, field = "name") =>
      Model.aggregate([
        { $match: { ...extraMatch, [field]: regex } },
        {
          $addFields: {
            relevance: {
              $switch: {
                branches: [
                  {
                    case: { $eq: [{ $toLower: `$${field}` }, query.toLowerCase()] },
                    then: 3,
                  },
                  {
                    case: { $regexMatch: { input: `$${field}`, regex: new RegExp(`^${query}`, "i") } },
                    then: 2,
                  },
                  {
                    case: { $regexMatch: { input: `$${field}`, regex: new RegExp(query, "i") } },
                    then: 1,
                  },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { relevance: -1, [field]: 1 } },
        { $limit: 10 },
      ]);

    // ✅ Main parallel searches
    const [categories, subcategories] = await Promise.all([
      weightedSearch(Category),
      weightedSearch(Subcategory),
    ]);

    // ✅ Product Search (populate subcategory + category)
    const productsBase = await Product.find({
      $or: [
        { name: regex },
        { "variants.name": regex },
      ],
    })
      .populate({
        path: "subcategory",
        populate: {
          path: "category",
          select: "name slug",
        },
      })
      .limit(20)
      .lean();

    // 🧩 Compute weighted relevance (same logic)
    const addRelevance = (p) => {
      const name = p.name.toLowerCase();
      const q = query.toLowerCase();

      if (name === q) return { ...p, relevance: 3 };
      if (name.startsWith(q)) return { ...p, relevance: 2 };
      if (name.includes(q)) return { ...p, relevance: 1 };
      return { ...p, relevance: 0 };
    };

    const mergedProducts = productsBase.map(addRelevance).sort((a, b) => b.relevance - a.relevance);

    // ✅ Final Response
    res.status(200).json({
      success: true,
      data: {
        categories,
        subcategories,
        products: mergedProducts,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};
