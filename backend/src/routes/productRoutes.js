import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../controllers/productController.js";
import { uploadImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Upload ảnh sản phẩm lên Cloudinary (JWT required)
router.post(
  "/upload-image",
  protect,
  authorize("admin", "warehouse"),
  upload.single("image"),
  uploadImage
);

router.post("/", protect, authorize("admin", "warehouse"), createProduct);
router.put("/:id", protect, authorize("admin", "warehouse"), updateProduct);
router.delete("/:id", protect, authorize("admin", "warehouse"), deleteProduct);
router.put("/:id/status", protect, authorize("admin"), updateProductStatus);

export default router;
