const Product = require("../models/Product");
const { uploadFile } = require("../services/mediaService");

// ✅ Create Variant
const createVariant = async (req, res) => {
  try {
    const { productId, name, about, guideline, optionGroups } = req.body;

    if (!productId || !name || !about) {
      return res.status(400).json({
        success: false,
        message: "productId, name, and about are required",
      });
    }

    // Get product with category & subcategory populated
    const product = await Product.findById(productId)
      .populate("category", "_id name")
      .populate("subcategory", "_id name");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Upload images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "At least one image is required" });
    }

    const imageUrls = await Promise.all(req.files.map(file => uploadFile(file.buffer, file.originalname)));

    const variant = {
      name,
      about,
      images: imageUrls,
      guideline: guideline || "",
      optionGroups: optionGroups ? JSON.parse(optionGroups) : [],
    };

    product.variants.push(variant);
    await product.save();

    const response = {
      ...product.variants[product.variants.length - 1]._doc,
      product: { id: product._id, name: product.name },
      category: { id: product.category._id, name: product.category.name },
      subcategory: { id: product.subcategory._id, name: product.subcategory.name },
    };

    res.status(201).json({ success: true, message: "Variant created successfully", data: response });
  } catch (err) {
    console.error("Error creating variant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get all variants for a product
const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

    const product = await Product.findById(productId)
      .populate("category", "_id name")
      .populate("subcategory", "_id name")
      .lean();

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variants = product.variants.map(v => ({
      ...v,
      product: { id: product._id, name: product.name },
      category: { id: product.category._id, name: product.category.name },
      subcategory: { id: product.subcategory._id, name: product.subcategory.name },
    }));

    res.status(200).json({ success: true, data: variants });
  } catch (err) {
    console.error("Error fetching variants:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get all variants across all products
const getAllVariants = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "_id name")
      .populate("subcategory", "_id name")
      .lean();

    const allVariants = [];
    products.forEach(product => {
      const variants = product.variants.map(v => ({
        ...v,
        product: { id: product._id, name: product.name },
        category: { id: product.category._id, name: product.category.name },
        subcategory: { id: product.subcategory._id, name: product.subcategory.name },
      }));
      allVariants.push(...variants);
    });

    res.status(200).json({ success: true, data: allVariants });
  } catch (err) {
    console.error("Error fetching all variants:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Variant
const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { productId, name, about, guideline, optionGroups } = req.body;

    if (!productId || !variantId) return res.status(400).json({ success: false, message: "productId and variantId are required" });

    const product = await Product.findById(productId)
      .populate("category", "_id name")
      .populate("subcategory", "_id name");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    if (name) variant.name = name;
    if (about) variant.about = about;
    if (guideline) variant.guideline = guideline;
    if (optionGroups) variant.optionGroups = JSON.parse(optionGroups);

    if (req.files && req.files.length > 0) {
      variant.images = await Promise.all(req.files.map(file => uploadFile(file.buffer, file.originalname)));
    }

    await product.save();

    const response = {
      ...variant._doc,
      product: { id: product._id, name: product.name },
      category: { id: product.category._id, name: product.category.name },
      subcategory: { id: product.subcategory._id, name: product.subcategory.name },
    };

    res.status(200).json({ success: true, message: "Variant updated successfully", data: response });
  } catch (err) {
    console.error("Error updating variant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Variant
const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { productId } = req.body;

    if (!productId || !variantId) return res.status(400).json({ success: false, message: "productId and variantId are required" });

    const product = await Product.findById(productId)
      .populate("category", "_id name")
      .populate("subcategory", "_id name");

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const variant = product.variants.id(variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    variant.remove();
    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
      product: { id: product._id, name: product.name },
      category: { id: product.category._id, name: product.category.name },
      subcategory: { id: product.subcategory._id, name: product.subcategory.name },
    });
  } catch (err) {
    console.error("Error deleting variant:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createVariant,
  getVariantsByProduct,
  getAllVariants,
  updateVariant,
  deleteVariant,
};
