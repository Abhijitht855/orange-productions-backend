const express = require("express");
const router = express.Router();
const {
  createManualReview,
  getAllManualReviews,
  getManualReviewById,
  updateManualReview,
  deleteManualReview,
} = require("../controllers/manualReviewController");
const adminAuth = require("../middlewares/adminAuth");

router.post("/",adminAuth, createManualReview);
router.get("/", getAllManualReviews);
router.get("/:id",adminAuth, getManualReviewById);
router.put("/:id",adminAuth, updateManualReview);
router.delete("/:id",adminAuth, deleteManualReview);

module.exports = router;
