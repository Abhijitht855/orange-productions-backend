const express = require("express");
const router = express.Router();

const upload = require("../middlewares/uploadMiddleware");
const adminAuth = require("../middlewares/adminAuth");
const {
  createBlog,
  updateBlog,
  getBlogs,
  getBlogBySlug,
  deleteBlog,
} = require("../controllers/blogController");


// Create blog
router.post("/", adminAuth, upload.single("thumbnail"), createBlog);

// Update blog
router.patch("/:id", adminAuth, upload.single("thumbnail"), updateBlog);

// Get all blogs
router.get("/", getBlogs);

// Get blog by slug
router.get("/:slug", getBlogBySlug);

// Delete (fixed route)
router.delete("/delete/:id", adminAuth, deleteBlog);

module.exports = router;
