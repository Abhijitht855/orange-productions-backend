const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/", adminAuth, upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.put("/:id", adminAuth, upload.single("image"), updateProduct);
router.delete("/:id", adminAuth, deleteProduct);

module.exports = router;
