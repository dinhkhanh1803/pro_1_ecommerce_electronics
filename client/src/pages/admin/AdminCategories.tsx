import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ImageIcon,
  LoaderCircleIcon,
  PackageOpenIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ADMIN_SIDEBAR } from "../../constants/sidebar";
import { useToast } from "../../context/ToastContext";

interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}

interface CategoryRouteState {
  successMessage?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  return (
    typeof value._id === "string" &&
    typeof value.name === "string" &&
    (value.slug === undefined || typeof value.slug === "string") &&
    (value.description === undefined || typeof value.description === "string") &&
    (value.image === undefined || typeof value.image === "string")
  );
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

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function AdminCategories() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showConfirm } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/categories",
      );
      if (!response.ok) {
        throw new Error(
          await responseMessage(response, "Không thể tải danh sách danh mục."),
        );
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isCategory)) {
        throw new Error("Dữ liệu danh mục từ máy chủ không hợp lệ.");
      }
      setCategories(data);
    } catch (error) {
      setLoadError(errorMessage(error, "Không thể tải danh sách danh mục."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const routeState = location.state as CategoryRouteState | null;
    if (!routeState?.successMessage) return;
    setSuccessMessage(routeState.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const filteredCategories = useMemo(() => {
    const query = normalize(searchQuery.trim());
    if (!query) return categories;
    return categories.filter((category) =>
      normalize(
        category.name + " " + (category.slug ?? "") + " " +
          (category.description ?? ""),
      ).includes(query),
    );
  }, [categories, searchQuery]);

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`, { confirmLabel: "Xóa" });
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return;
    }

    setDeletingId(category._id);
    setActionError("");
    setSuccessMessage("");
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/categories/" + category._id,
        {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        },
      );
      if (!response.ok) {
        throw new Error(
          await responseMessage(response, "Không thể xóa danh mục."),
        );
      }
      setCategories((current) =>
        current.filter((item) => item._id !== category._id),
      );
      setSuccessMessage("Đã xóa danh mục “" + category.name + "”.");
    } catch (error) {
      setActionError(errorMessage(error, "Không thể xóa danh mục."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Quản lý danh mục"
      role="Admin"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Danh mục sản phẩm
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý hình ảnh và thông tin các nhóm sản phẩm trên cửa hàng.
            </p>
          </div>
          <Link
            to="/admin/categories/new"
            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Link>
        </div>

        {successMessage && (
          <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span>{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage("")} className="shrink-0 rounded-md p-0.5 hover:bg-emerald-100" aria-label="Đóng thông báo">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
        {actionError && (
          <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError("")} className="shrink-0 rounded-md p-0.5 hover:bg-red-100" aria-label="Đóng thông báo lỗi">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-4 sm:p-5">
            <div className="relative max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo tên, slug hoặc mô tả..."
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-gray-500">
              <LoaderCircleIcon className="mb-3 h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Đang tải danh mục...</p>
            </div>
          ) : loadError ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <PackageOpenIcon className="mb-3 h-10 w-10 text-red-300" />
              <p className="max-w-md text-sm font-medium text-red-700">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => void fetchCategories()}
                className="mt-4 inline-flex items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <RefreshCwIcon className="mr-2 h-4 w-4" />
                Thử lại
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <PackageOpenIcon className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">
                {categories.length === 0
                  ? "Chưa có danh mục nào"
                  : "Không tìm thấy danh mục phù hợp"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                {categories.length === 0
                  ? "Hãy tạo danh mục đầu tiên để bắt đầu sắp xếp sản phẩm."
                  : "Hãy thử một từ khóa khác hoặc xóa nội dung tìm kiếm."}
              </p>
              {categories.length === 0 && (
                <Link
                  to="/admin/categories/new"
                  className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Thêm danh mục
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="w-24 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Hình ảnh
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Tên / Slug
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Mô tả
                    </th>
                    <th className="w-32 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCategories.map((category) => (
                    <tr key={category._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={"Ảnh danh mục " + category.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">{category.name}</p>
                        <p className="mt-1 font-mono text-xs text-gray-400">
                          /{category.slug || "chưa-có-slug"}
                        </p>
                      </td>
                      <td className="max-w-xl px-5 py-4 text-sm leading-6 text-gray-600">
                        {category.description?.trim() || (
                          <span className="italic text-gray-400">Chưa có mô tả</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={"/admin/categories/" + category._id + "/edit"}
                            className="rounded-lg bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            title="Sửa danh mục"
                            aria-label={"Sửa danh mục " + category.name}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDeleteCategory(category)}
                            disabled={deletingId !== null}
                            className="rounded-lg bg-gray-50 p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Xóa danh mục"
                            aria-label={"Xóa danh mục " + category.name}
                          >
                            {deletingId === category._id ? (
                              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2Icon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
