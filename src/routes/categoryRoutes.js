const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", upload.single("image"), createCategory);
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
