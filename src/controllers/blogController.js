const Blog = require("../models/Blog");
const slugify = require("slugify");
const { uploadFile } = require("../services/mediaService");

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    let thumbnailUrl = null;

    // Upload thumbnail to ImageKit
    if (req.file) {
      const uploadedUrl = await uploadFile(req.file.buffer, `blog_${Date.now()}`);
      thumbnailUrl = uploadedUrl;
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags ? tags.split(",") : [],
      thumbnail: thumbnailUrl,
    });

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags } = req.body;

    // Find blog
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Update slug if title is changed
    if (title) {
      blog.title = title;
      blog.slug = slugify(title, { lower: true, strict: true });
    }

    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.split(",");

    // If new file uploaded → upload to ImageKit
    if (req.file) {
      const newThumbnail = await uploadFile(
        req.file.buffer,
        `blog_${Date.now()}`
      );
      blog.thumbnail = newThumbnail;
    }

    await blog.save();

    res.json({
      success: true,
      message: "Blog updated",
      blog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all blogs
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
