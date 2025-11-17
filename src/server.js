require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // ✅ import helmet
const connectDB = require("./config/db");
const categoryRoutes = require("./routes/categoryRoutes");
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const adminRoutes = require("./routes/adminRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const searchRoutes = require("./routes/searchRoutes");
const MediaRoutes = require("./routes/mediaRoutes")
const manualReviewRoutes = require("./routes/manualReviewRoutes")
const blogRoutes = require("./routes/blogRoutes")




const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(cors()); // Enable CORS for all origins
app.use(helmet()); // Add security headers

// ✅ Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/media", MediaRoutes);
app.use("/api/manual-reviews", manualReviewRoutes);
app.use("/api/blogs", blogRoutes);



app.get("/", (req, res) => {
  res.send({ message:"API is running successfully!"});
});

// ✅ Connect DB and start server
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running securely on port ${PORT}`);
});

