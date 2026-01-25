const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import controller
const { uploadFile, uploadMultiple } = require("../controllers/uploadController");

// Import middleware
const { protect } = require("../middleware/authMiddleware");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ========================================
// ROUTES
// ========================================

// UPLOAD SINGLE FILE
// POST http://localhost:5000/api/upload
router.post("/", protect, upload.single("file"), uploadFile);

// UPLOAD MULTIPLE FILES
// POST http://localhost:5000/api/upload/multiple
router.post("/multiple", protect, upload.array("files"), uploadMultiple);

module.exports = router;
