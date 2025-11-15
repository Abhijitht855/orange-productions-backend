const express = require("express");
const multer = require("multer");
const { getMediaSections, updateMediaSections } = require("../controllers/mediaController");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload fields for all sections
router.put(
  "/", adminAuth,
  upload.fields([
    { name: "section1_images", maxCount: 2 },
    { name: "section1_video", maxCount: 1 },
    { name: "section2_image", maxCount: 1 },
    { name: "section3_video", maxCount: 1 },
    { name: "section4_images", maxCount: 10 }

  ]),
  updateMediaSections
);

router.get("/", getMediaSections);

module.exports = router;
