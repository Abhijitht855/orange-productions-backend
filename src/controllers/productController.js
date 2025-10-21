const Product = require("../models/Product");
const { uploadFile } = require("../services/mediaService");

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, category, subcategory } = req.body;
    let imageUrls = [];

    if (req.files) {
      for (const file of req.files) {
        const url = await uploadFile(file.buffer, file.originalname);
        imageUrls.push(url);
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      subcategory,
      images: imageUrls,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category subcategory").lean();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate("category subcategory").lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, slug, description, price, category, subcategory } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.slug = slug || product.slug;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;

    if (req.files) {
      const imageUrls = [];
      for (const file of req.files) {
        const url = await uploadFile(file.buffer, file.originalname);
        imageUrls.push(url);
      }
      product.images = imageUrls;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
};
