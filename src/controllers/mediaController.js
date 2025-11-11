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

    // Handle Section 1 uploads
    if (req.files?.section1_images) {
      const uploaded = await Promise.all(
        req.files.section1_images.map(async (file) =>
          uploadFile(file.buffer, file.originalname)
        )
      );
      data.section1.images = uploaded;
    }

    if (req.files?.section1_video?.[0]) {
      const videoUrl = await uploadFile(
        req.files.section1_video[0].buffer,
        req.files.section1_video[0].originalname
      );
      data.section1.video = videoUrl;
    }

    // Section 2 image
    if (req.files?.section2_image?.[0]) {
      const imageUrl = await uploadFile(
        req.files.section2_image[0].buffer,
        req.files.section2_image[0].originalname
      );
      data.section2.image = imageUrl;
    }

    // Section 3 video
    if (req.files?.section3_video?.[0]) {
      const videoUrl = await uploadFile(
        req.files.section3_video[0].buffer,
        req.files.section3_video[0].originalname
      );
      data.section3.video = videoUrl;
    }

    await data.save();
    res.json({ message: "Media updated successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
