import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/**
 * Upload 1 file ảnh lên Cloudinary
 * Route: POST /api/products/upload-image
 * Requires: JWT (protect middleware) + multer (upload.single("image"))
 */
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file được gửi lên" });
  }

  const uploadFromBuffer = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ecommerce/products",
          resource_type: "image",
          transformation: [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  uploadFromBuffer()
    .then((result) => {
      res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    })
    .catch((error) => {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ message: "Upload ảnh thất bại", error: error.message });
    });
};
