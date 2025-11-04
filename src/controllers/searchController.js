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

    // 🧠 Helper: Weighted Search
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
                  }, // exact match
                  {
                    case: { $regexMatch: { input: `$${field}`, regex: new RegExp(`^${query}`, "i") } },
                    then: 2,
                  }, // starts with
                  {
                    case: { $regexMatch: { input: `$${field}`, regex: new RegExp(query, "i") } },
                    then: 1,
                  }, // contains
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
    const [categories, subcategories, productsBase] = await Promise.all([
      weightedSearch(Category),
      weightedSearch(Subcategory),
      weightedSearch(Product),
    ]);

    // ✅ Variant search inside products
    const variantMatches = await Product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.name": regex } },
      {
        $addFields: {
          relevance: {
            $switch: {
              branches: [
                {
                  case: { $eq: [{ $toLower: "$variants.name" }, query.toLowerCase()] },
                  then: 3,
                },
                {
                  case: { $regexMatch: { input: "$variants.name", regex: new RegExp(`^${query}`, "i") } },
                  then: 2,
                },
                {
                  case: { $regexMatch: { input: "$variants.name", regex: new RegExp(query, "i") } },
                  then: 1,
                },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { relevance: -1, "variants.name": 1 } },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          "variants.name": 1,
          "variants.slug": 1,
          "variants.images": 1,
          "variants.price": 1,
        },
      },
      { $limit: 10 },
    ]);

    // 🧩 Merge variant hits into products list (avoiding duplicates)
    const productIds = new Set(productsBase.map((p) => p._id.toString()));
    const mergedProducts = [
      ...productsBase,
      ...variantMatches.filter((v) => !productIds.has(v._id.toString())),
    ];

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
