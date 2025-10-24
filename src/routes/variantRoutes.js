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
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createVariant,
  getVariantsByProduct,
  getAllVariants,
  updateVariant,
  deleteVariant,
} = require("../controllers/variantController");

// Create Variant
router.post("/variant", adminAuth, upload.array("images"), createVariant);

// Get all variants for a product
router.get("/variants/product/:productId", getVariantsByProduct);

// Get all variants across all products
router.get("/variants", getAllVariants);

// Update Variant
router.put("/variant/:variantId", adminAuth, upload.array("images"), updateVariant);

// Delete Variant
router.delete("/variant/:variantId", adminAuth, deleteVariant);

module.exports = router;
