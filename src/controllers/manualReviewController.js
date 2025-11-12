const ManualReview = require("../models/ManualReview");

// ✅ Create Review
const createManualReview = async (req, res) => {
  try {
    const { name, review, rating, link } = req.body;

    if (!name || !review || !rating) {
      return res
        .status(400)
        .json({ success: false, message: "Name, review, and rating are required" });
    }

    const newReview = await ManualReview.create({ name, review, rating, link });
    res.status(201).json({ success: true, data: newReview });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get All Reviews
const getAllManualReviews = async (req, res) => {
  try {
    const reviews = await ManualReview.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Get Single Review
const getManualReviewById = async (req, res) => {
  try {
    const review = await ManualReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update Review
const updateManualReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, review, rating, link } = req.body;

    const updatedReview = await ManualReview.findByIdAndUpdate(
      id,
      { name, review, rating, link },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: updatedReview });
  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete Review
const deleteManualReview = async (req, res) => {
  try {
    const review = await ManualReview.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createManualReview,
  getAllManualReviews,
  getManualReviewById,
  updateManualReview,
  deleteManualReview,
};
