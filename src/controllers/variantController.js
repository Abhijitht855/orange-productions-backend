const Product = require("../models/Product");
const { uploadFile } = require("../services/mediaService");
const slugify = require("slugify");

// Helpers
const makeVariantSlug = (name) => slugify(name, { lower: true, strict: true });

// Ensure variant slug is unique within a product
const hasVariantSlug = (product, slug, exceptId = null) =>
  product.variants.some(v => v.slug === slug && String(v._id) !== String(exceptId || ""));

// ✅ CREATE Variant (embedded in Product)
const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, about, price, sizes, quantity } = req.body;

    if (!name || !about) {
      return res.status(400).json({ success: false, message: "Variant name and about are required" });
    }

    // Handle variant images upload: accept single or multiple files
    let images = [];
    if (req.files && req.files.length > 0) {
      // multiple files via multer array()
      images = await Promise.all(
        req.files.map(f => uploadFile(f.buffer, f.originalname))
      );
    } else if (req.file) {
      // single file via multer single()
      const url = await uploadFile(req.file.buffer, req.file.originalname);
      images = [url];
    }

    if (!images.length) {
      return res.status(400).json({ success: false, message: "Variant images are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const slug = makeVariantSlug(name);
    if (hasVariantSlug(product, slug)) {
      return res.status(400).json({ success: false, message: "Variant with this slug already exists in this product" });
    }

    const variant = {
      name,
      about,
      images,
      slug,
      // optional fields
      price: price ?? undefined,
      sizes: Array.isArray(sizes) ? sizes : sizes ? [sizes] : undefined,
      quantity: typeof quantity === "number" ? quantity : undefined,
    };

    product.variants.push(variant);
    await product.save();

    const created = product.variants[product.variants.length - 1];
    return res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: created,
    });
  } catch (err) {
    console.error("Error creating variant:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET ALL Variants for a Product
const getVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Variants fetched successfully",
      data: product.variants || [],
    });
  } catch (err) {
    console.error("Error fetching variants:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET Variant by slug (within a Product)
const getVariantBySlug = async (req, res) => {
  try {
    const { productId, variantSlug } = req.params;
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const variant = (product.variants || []).find(v => v.slug === variantSlug);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Variant fetched successfully",
      data: variant,
    });
  } catch (err) {
    console.error("Error fetching variant:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE Variant by variantId
const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { name, about, price, sizes, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId); // subdoc find helper
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Optional: update images if files provided
    if (req.files && req.files.length > 0) {
      const images = await Promise.all(
        req.files.map(f => uploadFile(f.buffer, f.originalname))
      );
      variant.images = images;
    } else if (req.file) {
      const url = await uploadFile(req.file.buffer, req.file.originalname);
      variant.images = [url];
    }

    if (name && name !== variant.name) {
      const newSlug = makeVariantSlug(name);
      if (hasVariantSlug(product, newSlug, variantId)) {
        return res.status(400).json({ success: false, message: "Another variant with this slug already exists in this product" });
      }
      variant.slug = newSlug;
      variant.name = name;
    }

    if (about !== undefined) variant.about = about;
    if (price !== undefined) variant.price = price;
    if (sizes !== undefined) variant.sizes = Array.isArray(sizes) ? sizes : sizes ? [sizes] : [];
    if (quantity !== undefined) variant.quantity = quantity;

    await product.save(); // saves subdocs
    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (err) {
    console.error("Error updating variant:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE Variant by variantId
const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    variant.deleteOne(); // removes from array
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting variant:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createVariant,
  getVariants,
  getVariantBySlug,
  updateVariant,
  deleteVariant,
};
