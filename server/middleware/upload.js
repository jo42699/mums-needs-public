const multer = require("multer");
const path = require("path");

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|webp|gif|avif|svg|mp4|mov|avi|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;

  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed: images, videos, audio, documents, archives."
      )
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(), 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;