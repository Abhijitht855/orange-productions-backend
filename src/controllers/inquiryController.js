const Inquiry = require("../models/Inquiry");

// Create a new inquiry (from frontend form)
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, requiredItem } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !requiredItem) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and required item are required.",
      });
    }

    // ✅ Create inquiry directly
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      requiredItem,
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully!",
      data: inquiry,
    });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all inquiries (for admin)
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (err) {
    console.error("Error fetching inquiries:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createInquiry, getInquiries };
