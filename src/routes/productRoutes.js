const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/", upload.array("images", 5), createProduct);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.put("/:id", upload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
