const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", adminAuth, upload.single("image"), createCategory);
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.put("/:id",adminAuth, upload.single("image"), updateCategory);
router.delete("/:id", adminAuth, deleteCategory);

module.exports = router;
