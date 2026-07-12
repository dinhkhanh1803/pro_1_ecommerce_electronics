import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ADMIN_SIDEBAR } from "../../constants/sidebar";

interface CategoryFormData {
  name: string;
  description: string;
  image: string;
}

const INITIAL_FORM: CategoryFormData = {
  name: "",
  description: "",
  image: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const RASTER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const data: unknown = await response.json();
    if (isRecord(data) && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Dùng thông báo mặc định nếu phản hồi không phải JSON.
  }
  return fallback;
}

function parseCategory(value: unknown): CategoryFormData | null {
  if (!isRecord(value) || typeof value.name !== "string") return null;
  return {
    name: value.name,
    description:
      typeof value.description === "string" ? value.description : "",
    image: typeof value.image === "string" ? value.image : "",
  };
}

export function AdminCategoryForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState<CategoryFormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCategory = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/categories/" + id,
      );
      if (!response.ok) {
        throw new Error(
          await responseMessage(response, "Không thể tải thông tin danh mục."),
        );
      }
      const category = parseCategory(await response.json());
      if (!category) {
        throw new Error("Dữ liệu danh mục từ máy chủ không hợp lệ.");
      }
      setFormData(category);
    } catch (error) {
      setLoadError(errorMessage(error, "Không thể tải thông tin danh mục."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadCategory();
      return;
    }
    setFormData(INITIAL_FORM);
    setLoadError("");
    setLoading(false);
  }, [id, loadCategory]);

  const setField = (field: keyof CategoryFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formError) setFormError("");
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!RASTER_IMAGE_TYPES.has(file.type)) {
      setFormError("Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF hoặc AVIF.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError("Ảnh danh mục không được vượt quá 5MB.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setUploading(true);
    setFormError("");
    const uploadData = new FormData();
    uploadData.append("image", file);
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/categories/upload-image",
        {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: uploadData,
        },
      );
      if (!response.ok) {
        throw new Error(await responseMessage(response, "Tải ảnh lên thất bại."));
      }
      const data: unknown = await response.json();
      if (!isRecord(data) || typeof data.url !== "string" || !data.url) {
        throw new Error("Máy chủ không trả về đường dẫn ảnh hợp lệ.");
      }
      setField("image", data.url);
    } catch (error) {
      setFormError(errorMessage(error, "Tải ảnh lên thất bại."));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = formData.name.trim();
    const description = formData.description.trim();
    if (!name) {
      setFormError("Vui lòng nhập tên danh mục.");
      return;
    }
    if (uploading) {
      setFormError("Vui lòng chờ ảnh tải lên hoàn tất.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const endpoint = isEditing
        ? import.meta.env.VITE_API_URL + "/api/categories/" + id
        : import.meta.env.VITE_API_URL + "/api/categories";
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ name, description, image: formData.image }),
      });
      if (!response.ok) {
        throw new Error(
          await responseMessage(
            response,
            isEditing ? "Không thể cập nhật danh mục." : "Không thể tạo danh mục.",
          ),
        );
      }
      navigate("/admin/categories", {
        replace: true,
        state: {
          successMessage: isEditing
            ? "Cập nhật danh mục thành công."
            : "Thêm danh mục thành công.",
        },
      });
    } catch (error) {
      setFormError(
        errorMessage(
          error,
          isEditing ? "Không thể cập nhật danh mục." : "Không thể tạo danh mục.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      role="Admin"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin/categories"
          className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
          Quay lại danh sách danh mục
        </Link>

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
            <LoaderCircleIcon className="mb-3 h-9 w-9 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-gray-500">
              Đang tải thông tin danh mục...
            </p>
          </div>
        ) : loadError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-red-200 bg-white px-6 text-center shadow-sm">
            <p className="max-w-md text-sm font-medium text-red-700">{loadError}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void loadCategory()}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Thử lại
              </button>
              <Link
                to="/admin/categories"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </Link>
            </div>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin danh mục
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tên và mô tả giúp khách hàng nhận biết nhóm sản phẩm.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="category-name"
                      type="text"
                      value={formData.name}
                      onChange={(event) => setField("name", event.target.value)}
                      maxLength={120}
                      required
                      autoFocus
                      placeholder="Ví dụ: Điện thoại"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <p className="mt-1.5 text-xs text-gray-400">
                      Slug đường dẫn sẽ được hệ thống tạo tự động từ tên.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-4">
                      <label htmlFor="category-description" className="text-sm font-medium text-gray-700">
                        Mô tả
                      </label>
                      <span className="text-xs text-gray-400">
                        {formData.description.length}/1000
                      </span>
                    </div>
                    <textarea
                      id="category-description"
                      rows={7}
                      value={formData.description}
                      onChange={(event) => setField("description", event.target.value)}
                      maxLength={1000}
                      placeholder="Mô tả ngắn về các sản phẩm trong danh mục..."
                      className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </section>

              <section className="self-start rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ảnh danh mục
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ảnh vuông sẽ hiển thị đẹp nhất trên trang chủ.
                </p>

                <div className="relative mt-5 aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Ảnh xem trước của danh mục"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-gray-400">
                      <ImagePlusIcon className="mb-3 h-10 w-10" />
                      <p className="text-sm font-medium text-gray-600">
                        Chưa có ảnh danh mục
                      </p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 text-indigo-600 backdrop-blur-sm">
                      <LoaderCircleIcon className="mb-2 h-8 w-8 animate-spin" />
                      <span className="text-sm font-semibold">Đang tải ảnh...</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
                    <UploadCloudIcon className="mr-2 h-4 w-4" />
                    {formData.image ? "Thay ảnh" : "Chọn ảnh"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={(event) => void handleImageUpload(event)}
                      disabled={uploading || submitting}
                    />
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setField("image", "")}
                      disabled={uploading || submitting}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Gỡ ảnh
                    </button>
                  )}
                </div>
                <p className="mt-3 text-xs leading-5 text-gray-500">
                  Hỗ trợ JPG, PNG, WebP, GIF, AVIF. Dung lượng tối đa 5MB.
                </p>
              </section>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <Link
                to="/admin/categories"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Hủy
              </Link>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitting
                  ? "Đang lưu..."
                  : isEditing
                    ? "Cập nhật danh mục"
                    : "Thêm danh mục"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
