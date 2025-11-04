// routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const { searchAll } = require("../controllers/searchController");

// GET /api/search?query=gold
router.get("/", searchAll);

module.exports = router;
