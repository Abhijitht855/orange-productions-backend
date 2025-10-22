const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  about: String,
  images: [String],
  size: String,
  color: String,
  material: String,
  extraOptions: [
    {
      name: String,
      value: String,
    },
  ],
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
  image: String,
  variants: [variantSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
