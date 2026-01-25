const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ========================================
// UPLOAD - Handle single file upload
// ========================================
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, req.file.buffer);

    // Return URL
    const fileUrl = `/uploads/${filename}`;
    res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: filename,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========================================
// UPLOAD MULTIPLE - Handle multiple file uploads
// ========================================
const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const timestamp = Date.now();
      const filename = `${timestamp}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, file.buffer);
      uploadedUrls.push(`/uploads/${filename}`);
    }

    res.status(200).json({
      message: 'Files uploaded successfully',
      urls: uploadedUrls,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadFile,
  uploadMultiple,
};
