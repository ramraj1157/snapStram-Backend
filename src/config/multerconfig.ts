import multer from "multer";

// Store files in memory instead of disk storage for Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
});

export default upload;
