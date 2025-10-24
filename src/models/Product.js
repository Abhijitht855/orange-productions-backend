// const mongoose = require("mongoose");

// const variantSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   about: String,
//   images: [String],
//   size: String,
//   color: String,
//   material: String,
//   extraOptions: [
//     {
//       name: String,
//       value: String,
//     },
//   ],
// });

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, required: true, unique: true },
//   description: String,
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
//   subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
//   image: String,
//   variants: [variantSchema],
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

// Option inside a group
const optionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  quantity: Number,
  image: String,
});

// Option Group
const optionGroupSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  options: [optionSchema],
});

// Variant
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  about: { type: String, required: true },
  images: { type: [String], required: true },
  guideline: String,
  optionGroups: [optionGroupSchema],
});

// Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
  image: String,
  variants: [variantSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
