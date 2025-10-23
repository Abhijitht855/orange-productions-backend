const Inquiry = require("../models/Inquiry");
const Product = require("../models/Product");

// Create a new inquiry (from frontend form)
const createInquiry = async (req, res) => {
    try {
        const { name, email, phone, message, productId, variantId } = req.body;

        if (!name || !email || !productId || !variantId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Find product
        const product = await Product.findById(productId).lean();
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find variant inside product
        const variant = product.variants.find(v => v._id.toString() === variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: "Variant not found in product" });
        }

        // Create inquiry
        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            message,
            product: productId,
            variant: variantId,
        });

        res.status(201).json({
            success: true,
            message: "Inquiry sent successfully",
            data: inquiry,
        });
    } catch (err) {
        console.error("Error creating inquiry:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all inquiries (admin)
const getInquiries = async (req, res) => {
    try {
        // Fetch all inquiries and populate only product name & variants
        const inquiries = await Inquiry.find()
            .populate("product", "name variants")
            .sort({ createdAt: -1 })
            .lean();

        // Safely map variants inside each product
        const inquiriesWithVariant = inquiries.map((inq) => {
            const product = inq.product || {}; // prevent undefined error
            let variant = null;

            if (product.variants && inq.variant) {
                variant = product.variants.find(
                    (v) => v._id.toString() === inq.variant.toString()
                );
            }

            return {
                ...inq,
                productName: product.name || "Product not found",
                variantName: variant ? variant.name : "Variant not found",
            };
        });

        res.status(200).json({ success: true, data: inquiriesWithVariant });
    } catch (err) {
        console.error("Error fetching inquiries:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { createInquiry, getInquiries };
