const express = require("express");
const router = express.Router();
const { loginAdmin } = require("../controllers/adminController");

// Only login route
router.post("/login", loginAdmin);

module.exports = router;
