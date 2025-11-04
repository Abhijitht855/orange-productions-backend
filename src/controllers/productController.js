const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const { uploadFile } = require("../services/mediaService");
const slugify = require("slugify");

// ✅ CREATE Product
const createProduct = async (req, res) => {
  try {
    const { name, description, category, subcategory } = req.body;

    if (!name || !category || !subcategory) {
      return res.status(400).json({ success: false, message: "Product name, category, and subcategory are required" });
    }


    // Check valid category/subcategory
    const categoryExists = await Category.findById(category);
    if (!categoryExists)
      return res.status(404).json({ success: false, message: "Invalid category ID" });

    if (subcategory) {
      const subcatExists = await Subcategory.findById(subcategory);
      if (!subcatExists)
        return res.status(404).json({ success: false, message: "Invalid subcategory ID" });
    }

    // Slug
    const slug = slugify(name, { lower: true, strict: true });

    // Prevent duplicate
    const existing = await Product.findOne({ slug });
    if (existing)
      return res.status(400).json({ success: false, message: "Product already exists" });

    // Upload main image
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadFile(req.file.buffer, req.file.originalname);
    }

    const product = await Product.create({
      name,
      slug,
      description,
      category,
      subcategory,
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET ALL Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subcategory", "name")
      .sort({ createdAt: 1 }) 
      .lean();

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET Product by slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name")
      .populate("subcategory", "name")
      .lean();

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE Product
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, subcategory } = req.body;

    // Find the product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // ✅ Require category and subcategory
    if (!category || !subcategory) {
      return res.status(400).json({
        success: false,
        message: "Category and subcategory are required",
      });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: "Invalid category ID" });
    }

    // Validate subcategory exists
    const subcatExists = await Subcategory.findById(subcategory);
    if (!subcatExists) {
      return res.status(404).json({ success: false, message: "Invalid subcategory ID" });
    }

    // Update slug if name changes
    if (name && name !== product.name) {
      product.slug = slugify(name, { lower: true, strict: true });
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category;
    product.subcategory = subcategory;

    // Update image if uploaded
    if (req.file) {
      product.image = await uploadFile(req.file.buffer, req.file.originalname);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateProduct };


// ✅ DELETE Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
};
