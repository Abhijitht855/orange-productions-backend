// const SeoConfig = require("../models/SeoConfig");
// const { uploadFile } = require("../services/mediaService");

// /**
//  * PUBLIC: Get SEO by pageKey
//  */
// exports.getSeoByPageKey = async (req, res) => {
//   try {
//     const { pageKey } = req.params;

//     const seo = await SeoConfig.findOne({ pageKey, isActive: true }).lean();
//     if (!seo) return res.status(404).json({ message: "SEO config not found" });

//     return res.json(seo); // frontend expects a raw object
//   } catch (err) {
//     console.error("getSeoByPageKey:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// /**
//  * ADMIN: Upsert SEO (supports FormData + image upload)
//  * POST /api/admin/seo
//  */
// exports.upsertSeo = async (req, res) => {
//   try {
//     const payload = req.body;

//     if (!payload.pageKey) {
//       return res
//         .status(400)
//         .json({ success: false, message: "pageKey is required" });
//     }

//     let ogImageUrl;

//     // If file uploaded → upload to ImageKit
//     if (req.file) {
//       ogImageUrl = await uploadFile(req.file.buffer, req.file.originalname);
//     }

//     const updateData = {
//       title: payload.title,
//       description: payload.description,
//       keywords: payload.keywords,
//       canonical: payload.canonical,
//       ogTitle: payload.ogTitle,
//       ogDescription: payload.ogDescription,
//       twitterCard: payload.twitterCard,
//       twitterSite: payload.twitterSite,
//       updatedBy: payload.updatedBy || "admin",
//     };

//     if (ogImageUrl) {
//       updateData.ogImages = [
//         {
//           url: ogImageUrl,
//           alt: payload.ogTitle || payload.title,
//           width: 1200,
//           height: 630,
//         },
//       ];
//     }

//     const updated = await SeoConfig.findOneAndUpdate(
//       { pageKey: payload.pageKey },
//       { $set: updateData },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     ).lean();

//     return res.json({ success: true, seo: updated });
//   } catch (err) {
//     console.error("upsertSeo:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// /**
//  * ADMIN: List all SEO configs
//  */
// exports.listAll = async (req, res) => {
//   try {
//     const items = await SeoConfig.find().sort({ pageKey: 1 }).lean();
//     return res.json({ success: true, data: items });
//   } catch (err) {
//     console.error("listAll:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// /**
//  * ADMIN: Deactivate SEO config
//  */
// exports.deleteSeo = async (req, res) => {
//   try {
//     const { pageKey } = req.params;
//     await SeoConfig.findOneAndUpdate({ pageKey }, { isActive: false });
//     return res.json({ success: true });
//   } catch (err) {
//     console.error("deleteSeo:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// src/controllers/seoController.js
const SeoConfig = require("../models/SeoConfig");
const { uploadFile } = require("../services/mediaService");

/**
 * PUBLIC — Get SEO config by pageKey
 */
exports.getSeoByPageKey = async (req, res) => {
  try {
    const { pageKey } = req.params;

    const seo = await SeoConfig.findOne({ pageKey, isActive: true }).lean();
    if (!seo) return res.status(404).json({ message: "SEO config not found" });

    return res.json(seo);
  } catch (err) {
    console.error("getSeoByPageKey:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * ADMIN — Upsert SEO (supports FormData + Image upload)
 */
exports.upsertSeo = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.pageKey) {
      return res
        .status(400)
        .json({ success: false, message: "pageKey is required" });
    }

    let ogImageUrl = null;

    // If file uploaded → Upload to ImageKit
    if (req.file) {
      ogImageUrl = await uploadFile(req.file.buffer, req.file.originalname);
    }

    // Prepare update fields
    const updateData = {
      title: payload.title || "",
      description: payload.description || "",
      keywords: payload.keywords || "",
      canonical: payload.canonical || "",
      ogTitle: payload.ogTitle || "",
      ogDescription: payload.ogDescription || "",
      updatedBy: payload.updatedBy || "admin",
    };

    // If new OG image uploaded → add
    if (ogImageUrl) {
      updateData.ogImages = [
        {
          url: ogImageUrl,
          alt: payload.ogTitle || payload.title || "",
          width: 1200,
          height: 630,
        },
      ];
    }

    const updated = await SeoConfig.findOneAndUpdate(
      { pageKey: payload.pageKey },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({ success: true, seo: updated });
  } catch (err) {
    console.error("upsertSeo:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * ADMIN — List all SEO configs
 */
exports.listAll = async (req, res) => {
  try {
    const items = await SeoConfig.find().sort({ pageKey: 1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("listAll:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * ADMIN — Soft delete SEO config
 */
exports.deleteSeo = async (req, res) => {
  try {
    const { pageKey } = req.params;
    await SeoConfig.findOneAndUpdate(
      { pageKey },
      { isActive: false }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteSeo:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
