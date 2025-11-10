// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const upload = require("../middlewares/uploadMiddleware");
// const adminAuth = require("../middlewares/adminAuth");
// const {
//   createVariant,
//   getVariants,
//   getVariantById,
//   updateVariant,
//   deleteVariant,
// } = require("../controllers/variantController");

// // Product-level routes
// router.post("/:productId/variants",adminAuth, upload.array("images"), createVariant);
// router.get("/:productId/variants", getVariants);
// router.get("/:productId/variants/:variantId", getVariantById);
// router.put("/:productId/variants/:variantId",adminAuth, upload.array("images"), updateVariant);
// router.delete("/:productId/variants/:variantId",adminAuth, deleteVariant);

// module.exports = router;
// routes/variantRoutes.js
const express = require("express");
// mergeParams allows this router to access :productId from the parent mount
const router = express.Router({ mergeParams: true });
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");

const {
  createVariant,
  getVariants,
  getVariantBySlug,
  updateVariant,
  deleteVariant,
} = require("../controllers/variantController");

// Create variant (images: single or multiple)
// If your uploadMiddleware exposes both single and array handlers,
// you can create a dedicated middleware. Otherwise use `any()` and
// let the controller read req.file or req.files.
router.post(
  "/",
  adminAuth,
  upload.any(), // handles images + optional PDF
  createVariant
);


// List variants for a product
router.get("/", getVariants);

// Get variant by slug
router.get("/:variantSlug", getVariantBySlug);

// Update a variant (by variantId)
router.put(
  "/:variantId",
  adminAuth,
  upload.any(), // handles images + optional PDF
  updateVariant
);

// Delete a variant
router.delete("/:variantId", adminAuth, deleteVariant);

module.exports = router;
