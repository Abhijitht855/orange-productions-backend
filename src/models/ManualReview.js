const mongoose = require("mongoose");

const manualReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    link: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ManualReview", manualReviewSchema);
