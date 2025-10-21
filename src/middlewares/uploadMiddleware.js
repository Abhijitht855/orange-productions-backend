const multer = require("multer");
const storage = multer.memoryStorage(); // store files in memory to send to ImageKit
const upload = multer({ storage });

module.exports = upload;
