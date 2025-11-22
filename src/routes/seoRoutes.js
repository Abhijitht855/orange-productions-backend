const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // memory storage
const seoController = require("../controllers/seoController");

// PUBLIC
router.get("/:pageKey", seoController.getSeoByPageKey);

// ADMIN
router.get("/", seoController.listAll);
router.post("/", upload.single("ogImage"), seoController.upsertSeo);
router.delete("/:pageKey", seoController.deleteSeo);

module.exports = router;
