const express = require("express");
const router = express.Router({ mergeParams: true });
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createVariant,
  getVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
} = require("../controllers/variantController");

// Product-level routes
router.post("/:productId/variants",adminAuth, upload.array("images"), createVariant);
router.get("/:productId/variants", getVariants);
router.get("/:productId/variants/:variantId", getVariantById);
router.put("/:productId/variants/:variantId",adminAuth, upload.array("images"), updateVariant);
router.delete("/:productId/variants/:variantId",adminAuth, deleteVariant);

module.exports = router;
