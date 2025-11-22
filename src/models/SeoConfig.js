// src/models/SeoConfig.js
const mongoose = require("mongoose");

const OpenGraphImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: "" },
  width: { type: Number },
  height: { type: Number },
});

const seoConfigSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    keywords: { type: String, default: "" },
    canonical: { type: String, default: "" },

    // OpenGraph (FB / LinkedIn / WhatsApp etc.)
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImages: [OpenGraphImageSchema],

    // optional custom JSON blob
    extra: { type: mongoose.Schema.Types.Mixed },

    updatedBy: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoConfig", seoConfigSchema);
