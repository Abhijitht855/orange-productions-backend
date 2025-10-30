const Subcategory = require("../models/Subcategory");
const Category = require("../models/Category");
const { uploadFile } = require("../services/mediaService");
const slugify = require("slugify");
const Product = require("../models/Product");

// Create subcategory
const createSubcategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and category are required",
      });
    }

    // Validate category ID
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid category ID — category not found",
      });
    }

    // Auto-generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // Prevent duplicates
    const existing = await Subcategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Subcategory already exists with this name",
      });
    }

    // Upload image if exists
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname);
    }

    const subcategory = await Subcategory.create({
      name,
      slug,
      description,
      category,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory,
    });
  } catch (err) {
    console.error("Error creating subcategory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all subcategories
const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("category", "name slug")
      .lean();

    res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single subcategory by slug
const getSubcategoryBySlug = async (req, res) => {
  try {
    const subcategory = await Subcategory.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .lean();

    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });

    res.status(200).json({
      success: true,
      message: "Subcategory fetched successfully",
      data: subcategory,
    });
  } catch (err) {
    console.error("Error fetching subcategory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update subcategory
const updateSubcategory = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory)
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });

    // Auto update slug if name changes
    if (name && name !== subcategory.name) {
      subcategory.slug = slugify(name, { lower: true, strict: true });
    }

    subcategory.name = name || subcategory.name;
    subcategory.description = description || subcategory.description;
    subcategory.category = category || subcategory.category;

    if (req.file) {
      subcategory.image = await uploadFile(req.file.buffer, req.file.originalname);
    }

    await subcategory.save();

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory,
    });
  } catch (err) {
    console.error("Error updating subcategory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete subcategory
const deleteSubcategory = async (req, res) => {
  try {
    // Find the subcategory first
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    // ✅ Delete all products under this subcategory
    await Product.deleteMany({ subcategory: subcategory._id });

    // ✅ Delete the subcategory itself
    await Subcategory.findByIdAndDelete(subcategory._id);

    res.status(200).json({
      success: true,
      message: "Subcategory and all related products deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting subcategory:", err);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subcategory",
    });
  }
};

module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategoryBySlug,
  updateSubcategory,
  deleteSubcategory,
};
