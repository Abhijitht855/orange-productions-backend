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

// Variant: required -> name, about, images; optional -> price, sizes, quantity; plus slug
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },            // required [web:4]
  about: { type: String, required: true },           // required [web:4]
  images: { type: [String], required: true },        // required array path [web:5]
  slug: { type: String, required: true },            // slug on subdocument [web:19]
  price: { type: Number },                           // optional [web:4]
  sizes: { type: [String] },                         // optional [web:4]
  quantity: { type: Number },                        // optional [web:4]
});

// Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },            // required [web:4]
  slug: { type: String, required: true, unique: true }, // unique product slug [web:13]
  description: String,                               // optional [web:4]
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },   // ref [web:13]
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true }, // ref [web:13]
  image: String,                                     // optional [web:4]
  variants: [variantSchema],                         // embedded variants [web:19]
  createdAt: { type: Date, default: Date.now },      // default [web:13]
});

module.exports = mongoose.model("Product", productSchema);
