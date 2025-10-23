const express = require("express");
const router = express.Router();
const adminAuth = require("../middlewares/adminAuth"); // protect admin route
const { createInquiry, getInquiries } = require("../controllers/inquiryController");

// Public route: user submits inquiry
router.post("/", createInquiry);

// Admin route: get all inquiries
router.get("/", adminAuth, getInquiries);

module.exports = router;
