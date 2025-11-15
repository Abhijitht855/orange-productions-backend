const mongoose = require("mongoose");

const mediaSectionSchema = new mongoose.Schema({
  section1: {
    images: [String], // 2 images
    video: String,    // 1 video
  },
  section2: {
    image: String,
  },
  section3: {
    video: String,
  },
  // NEW: Multiple Images Section
  section4: {
    images: [String], // Unlimited images
  },
}, { timestamps: true });

module.exports = mongoose.model("MediaSection", mediaSectionSchema);