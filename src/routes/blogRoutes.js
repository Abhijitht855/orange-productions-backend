const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const blogController = require("../controllers/blogController");

// Create blog with ImageKit upload
router.post(
  "/",
  adminAuth,
  upload.single("thumbnail"),
  blogController.createBlog
);

router.patch(
  "/:id",
  adminAuth,
  upload.single("thumbnail"),
  blogController.updateBlog
);


router.get("/", blogController.getBlogs);
router.get("/:slug", blogController.getBlogBySlug);
router.delete("/:id", adminAuth, blogController.deleteBlog);

module.exports = router;
