import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { uploadCategoryImage } from "../controllers/uploadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { categoryUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post(
  "/upload-image",
  protect,
  authorize("admin"),
  categoryUpload.single("image"),
  uploadCategoryImage,
);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
