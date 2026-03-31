import multer from "multer";

// Dùng memoryStorage để không ghi file ra disk, stream thẳng lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (image/*)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi ảnh
  },
});

export default upload;
