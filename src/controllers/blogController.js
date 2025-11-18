const Blog = require("../models/Blog");
const slugify = require("slugify");
const { uploadFile } = require("../services/mediaService");

// Create Blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    // Slug duplicate check
    const exists = await Blog.findOne({ slug });
    if (exists) {
      return res.status(400).json({ error: "A blog with this title already exists" });
    }

    let thumbnailUrl = null;

    if (req.file) {
      thumbnailUrl = await uploadFile(req.file.buffer, `blog_${Date.now()}`);
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

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // If updating title → update slug
    if (title) {
      const newSlug = slugify(title, { lower: true, strict: true });

      // Check if another blog uses this slug
      const exists = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (exists) {
        return res.status(400).json({ error: "Another blog already uses this title" });
      }

      blog.title = title;
      blog.slug = newSlug;
    }

    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (category) blog.category = category;
    if (tags) blog.tags = tags.split(",");

    if (req.file) {
      blog.thumbnail = await uploadFile(req.file.buffer, `blog_${Date.now()}`);
    }

    await blog.save();

    res.json({ success: true, message: "Blog updated", blog });
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


// Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
