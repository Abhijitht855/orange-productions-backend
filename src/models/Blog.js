const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: String,
    thumbnail: String,
    category: String,
    tags: [String],
    author: {
      type: String,
      default: "Admin"
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
