import multer from "multer";

// Dùng memoryStorage để không ghi file ra disk, stream thẳng lên Cloudinary
const storage = multer.memoryStorage();

const categoryImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (image/*)"), false);
  }
};

const categoryFileFilter = (req, file, cb) => {
  if (categoryImageMimeTypes.has(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error("Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF, AVIF hoặc HEIC");
  error.statusCode = 415;
  return cb(error, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB mỗi ảnh
  },
});

export const categoryUpload = multer({
  storage,
  fileFilter: categoryFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
