const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  createSubcategory,
  getSubcategories,
  getSubcategoryBySlug,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

router.post("/", upload.single("image"), createSubcategory);
router.get("/", getSubcategories);
router.get("/:slug", getSubcategoryBySlug);
router.put("/:id", upload.single("image"), updateSubcategory);
router.delete("/:id", deleteSubcategory);

module.exports = router;
