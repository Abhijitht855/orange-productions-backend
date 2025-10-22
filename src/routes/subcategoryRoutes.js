const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createSubcategory,
  getSubcategories,
  getSubcategoryBySlug,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

router.post("/", adminAuth, upload.single("image"), createSubcategory);
router.get("/", getSubcategories);
router.get("/:slug", getSubcategoryBySlug);
router.put("/:id", adminAuth, upload.single("image"), updateSubcategory);
router.delete("/:id", adminAuth, deleteSubcategory);

module.exports = router;
