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
      return res
        .status(400)
        .json({ success: false, message: "Variant name and about are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // ✅ Separate handling for images and catalogue PDF
    let images = [];
    let catalogue = undefined;

    if (req.files && req.files.length > 0) {
      // Split files by mimetype
      const imageFiles = req.files.filter(f => f.mimetype.startsWith("image/"));
      const pdfFile = req.files.find(f => f.mimetype === "application/pdf");

      // Upload images
      if (imageFiles.length > 0) {
        images = await Promise.all(
          imageFiles.map(f => uploadFile(f.buffer, f.originalname))
        );
      }

      // Upload catalogue PDF (if provided)
      if (pdfFile) {
        catalogue = await uploadFile(pdfFile.buffer, pdfFile.originalname);
      }
    } else if (req.file) {
      // Single file (backward-compatible)
      if (req.file.mimetype.startsWith("image/")) {
        const url = await uploadFile(req.file.buffer, req.file.originalname);
        images = [url];
      } else if (req.file.mimetype === "application/pdf") {
        catalogue = await uploadFile(req.file.buffer, req.file.originalname);
      }
    }

    if (!images.length) {
      return res
        .status(400)
        .json({ success: false, message: "Variant images are required" });
    }

    const slug = makeVariantSlug(name);
    if (hasVariantSlug(product, slug)) {
      return res.status(400).json({
        success: false,
        message: "Variant with this slug already exists in this product",
      });
    }

    // ✅ Create variant object with catalogue support
    const variant = {
      name,
      about,
      images,
      slug,
      price: price ?? undefined,
      sizes: Array.isArray(sizes) ? sizes : sizes ? [sizes] : undefined,
      quantity: typeof quantity === "number" ? quantity : undefined,
      catalogue, // <-- added
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
    return res
      .status(500)
      .json({ success: false, message: err.message });
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

// UPDATE Variant by variantId
const updateVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { name, about, price, sizes, quantity, removeCatalogue } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.id(variantId); // subdoc helper
    if (!variant) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }

    // Handle files: separate images & catalogue PDF
    if (req.files && req.files.length > 0) {
      const imageFiles = req.files.filter(f => f.mimetype.startsWith("image/"));
      const pdfFile = req.files.find(f => f.mimetype === "application/pdf");

      // Update images if provided
      if (imageFiles.length > 0) {
        const images = await Promise.all(
          imageFiles.map(f => uploadFile(f.buffer, f.originalname))
        );
        variant.images = images;
      }

      // Replace catalogue if PDF provided
      if (pdfFile) {
        const catalogueUrl = await uploadFile(pdfFile.buffer, pdfFile.originalname);
        variant.catalogue = catalogueUrl;
      }
    } else if (req.file) {
      // Backward compatibility
      if (req.file.mimetype.startsWith("image/")) {
        const url = await uploadFile(req.file.buffer, req.file.originalname);
        variant.images = [url];
      } else if (req.file.mimetype === "application/pdf") {
        const catalogueUrl = await uploadFile(req.file.buffer, req.file.originalname);
        variant.catalogue = catalogueUrl;
      }
    }

    // Remove catalogue if requested
    if (removeCatalogue === "true") {
      variant.catalogue = undefined;
    }

    // Update name & slug
    if (name && name !== variant.name) {
      const newSlug = makeVariantSlug(name);
      if (hasVariantSlug(product, newSlug, variantId)) {
        return res.status(400).json({
          success: false,
          message: "Another variant with this slug already exists in this product",
        });
      }
      variant.slug = newSlug;
      variant.name = name;
    }

    // Update about
    if (about !== undefined) {
      variant.about = about;
    }

    // CLEARABLE: Price → null if "null" string
    if (price !== undefined) {
      if (price === "null") {
        variant.price = null;
      } else {
        const num = Number(price);
        variant.price = isNaN(num) ? variant.price : num; // keep old if invalid
      }
    }

    // CLEARABLE: Sizes → [] if "null" string
    if (sizes !== undefined) {
      if (sizes === "null") {
        variant.sizes = [];
      } else if (Array.isArray(sizes)) {
        variant.sizes = sizes.filter(s => s && s.trim());
      } else if (typeof sizes === "string") {
        variant.sizes = sizes
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      } else {
        variant.sizes = [];
      }
    }

    // CLEARABLE: Quantity → null if "null" string
    if (quantity !== undefined) {
      if (quantity === "null") {
        variant.quantity = null;
      } else {
        const num = Number(quantity);
        variant.quantity = isNaN(num) ? variant.quantity : num;
      }
    }

    await product.save(); // persist subdoc changes

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
