const Category = require("../models/Category");
const { uploadFile } = require("../services/mediaService");
const slugify = require("slugify"); // ✅ install with: npm install slugify

// Create new category (auto slug + validations)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    // ✅ Auto-generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // ✅ Prevent duplicate slug
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname);
    }

    const category = await Category.create({ name, slug, description, image: imageUrl });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ success: false, message: "Server error while creating category" });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ success: false, message: "Server error while fetching categories" });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error fetching category:", err);
    res.status(500).json({ success: false, message: "Server error while fetching category" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Auto-update slug if name changes
    if (name && name !== category.name) {
      category.slug = slugify(name, { lower: true, strict: true });
    }

    category.name = name || category.name;
    category.description = description || category.description;

    if (req.file) {
      category.image = await uploadFile(req.file.buffer, req.file.originalname);
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ success: false, message: "Server error while updating category" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ success: false, message: "Server error while deleting category" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
