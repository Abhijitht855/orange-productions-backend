const MediaSection = require("../models/MediaSection");
const { uploadFile } = require("../services/mediaService");

exports.getMediaSections = async (req, res) => {
  try {
    const data = await MediaSection.findOne();
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMediaSections = async (req, res) => {
  try {
    let data = await MediaSection.findOne();
    if (!data) data = new MediaSection();

    // Helper: Upload multiple files
    const uploadMultiple = async (files) => {
      return Promise.all(
        files.map(async (file) => uploadFile(file.buffer, file.originalname))
      );
    };

    // SECTION 1
    if (req.files?.section1_images) {
      const uploaded = await uploadMultiple(req.files.section1_images);
      data.section1.images = uploaded;
    }

    if (req.files?.section1_video?.[0]) {
      data.section1.video = await uploadFile(
        req.files.section1_video[0].buffer,
        req.files.section1_video[0].originalname
      );
    }

    // SECTION 2
    if (req.files?.section2_image?.[0]) {
      data.section2.image = await uploadFile(
        req.files.section2_image[0].buffer,
        req.files.section2_image[0].originalname
      );
    }

    // SECTION 3
    if (req.files?.section3_video?.[0]) {
      data.section3.video = await uploadFile(
        req.files.section3_video[0].buffer,
        req.files.section3_video[0].originalname
      );
    }

    // NEW: SECTION 4 – Multiple Images
    if (req.files?.section4_images) {
      const uploaded = await uploadMultiple(req.files.section4_images);
      // Append new images (or replace if you prefer)
      data.section4.images = [...data.section4.images, ...uploaded];
      // Optional: deduplicate
      data.section4.images = [...new Set(data.section4.images)];
    }

    // Optional: DELETE specific image from section4
    if (req.body.deleteSection4Image) {
      data.section4.images = data.section4.images.filter(
        (url) => url !== req.body.deleteSection4Image
      );
    }

    await data.save();
    res.json({ message: "Media updated successfully", data });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};