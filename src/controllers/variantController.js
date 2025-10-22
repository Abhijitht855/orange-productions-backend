const Product = require("../models/Product");
const { uploadFile } = require("../services/mediaService");

// ✅ Create a Variant
const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, about, size, color, material, extraOptions } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Variant name is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Upload multiple images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(file => uploadFile(file.buffer, file.originalname))
      );
    }

    const variant = {
      name,
      about,
      images: imageUrls,
      size,
      color,
      material,
      extraOptions: extraOptions ? JSON.parse(extraOptions) : [],
    };

    product.variants.push(variant);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      data: product.variants[product.variants.length - 1],
    });
  } catch (err) {
    console.error("Error creating variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all Variants of a Product
const getVariants = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Variants fetched successfully",
      data: product.variants,
    });
  } catch (err) {
    console.error("Error fetching variants:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get Single Variant
const getVariantById = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.find(v => v._id.toString() === variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    res.status(200).json({ success: true, data: variant });
  } catch (err) {
    console.error("Error fetching variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Variant
const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { name, about, size, color, material, extraOptions } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    // Upload new images if provided
    let imageUrls = variant.images;
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(file => uploadFile(file.buffer, file.originalname))
      );
    }

    // Update fields
    variant.name = name || variant.name;
    variant.about = about || variant.about;
    variant.images = imageUrls;
    variant.size = size || variant.size;
    variant.color = color || variant.color;
    variant.material = material || variant.material;
    variant.extraOptions = extraOptions ? JSON.parse(extraOptions) : variant.extraOptions;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (err) {
    console.error("Error updating variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete Variant
const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    variant.remove();
    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createVariant,
  getVariants,
  getVariantById,
  updateVariant,
  deleteVariant,
};
