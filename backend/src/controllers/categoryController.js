import Category from "../models/Category.js";

function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function validateCategoryInput(body = {}, { isCreate = false } = {}) {
  const data = {};

  if (isCreate || body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return { error: "Tên danh mục là bắt buộc" };
    }

    const name = body.name.trim();
    if (name.length > 120) {
      return { error: "Tên danh mục không được vượt quá 120 ký tự" };
    }

    const slug = generateSlug(name);
    if (!slug) {
      return { error: "Tên danh mục phải chứa ít nhất một chữ cái hoặc chữ số hợp lệ" };
    }

    data.name = name;
    data.slug = slug;
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") {
      return { error: "Mô tả danh mục phải là chuỗi" };
    }

    const description = body.description.trim();
    if (description.length > 1000) {
      return { error: "Mô tả danh mục không được vượt quá 1000 ký tự" };
    }
    data.description = description;
  } else if (isCreate) {
    data.description = "";
  }

  if (body.image !== undefined) {
    if (typeof body.image !== "string") {
      return { error: "Đường dẫn ảnh danh mục phải là chuỗi" };
    }

    const image = body.image.trim();
    if (image.length > 2048) {
      return { error: "Đường dẫn ảnh danh mục quá dài" };
    }

    if (image) {
      try {
        const imageUrl = new URL(image);
        if (!["http:", "https:"].includes(imageUrl.protocol)) {
          return { error: "Ảnh danh mục phải sử dụng đường dẫn HTTP hoặc HTTPS" };
        }
      } catch {
        return { error: "Đường dẫn ảnh danh mục không hợp lệ" };
      }
    }

    data.image = image;
  } else if (isCreate) {
    data.image = "";
  }

  return { data };
}

function handleDuplicateSlug(error, res) {
  if (error?.code !== 11000) return false;
  res.status(409).json({ message: "Tên danh mục đã tồn tại" });
  return true;
}

export const createCategory = async (req, res, next) => {
  try {
    const { data, error } = validateCategoryInput(req.body, { isCreate: true });
    if (error) return res.status(400).json({ message: error });

    const existing = await Category.exists({ slug: data.slug });
    if (existing) {
      return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
    }

    const category = await Category.create(data);
    res.status(201).json(category);
  } catch (error) {
    if (handleDuplicateSlug(error, res)) return;
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { data, error } = validateCategoryInput(req.body);
    if (error) return res.status(400).json({ message: error });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu danh mục để cập nhật" });
    }

    if (data.slug) {
      const existing = await Category.exists({
        _id: { $ne: req.params.id },
        slug: data.slug,
      });
      if (existing) {
        return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
      }
    }

    const category = await Category.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    if (handleDuplicateSlug(error, res)) return;
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
