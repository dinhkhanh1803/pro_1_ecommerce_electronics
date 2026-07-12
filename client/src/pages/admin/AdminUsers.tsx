import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  ShoppingBagIcon,
  SearchIcon,
  FilterIcon,
  LockIcon,
  UnlockIcon,
  MoreVerticalIcon,
  XIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { ADMIN_SIDEBAR } from "../../constants/sidebar";
import { useToast } from "../../context/ToastContext";

export function AdminUsers() {
  const { showConfirm } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?role=${roleFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1); // Reset page on filter change
  }, [roleFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on search
  }, [searchQuery]);

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleToggleLock = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}/lock`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error toggling lock", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const confirmed = await showConfirm("Bạn có chắc muốn đổi quyền của người dùng này?", { confirmLabel: "Đổi quyền", type: "info" });
    if (!confirmed) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );
      if (res.ok) fetchUsers();
      else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Quản lý người dùng"
      role="Admin"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="customer">Khách hàng</option>
              <option value="seller">Người bán</option>
              <option value="shipper">Người giao hàng</option>
              <option value="warehouse">Quản lý kho</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {/* 
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto">
          Export Users
        </button> */}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đơn hàng/Doanh số
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
                          }
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />

                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : user.role === "seller"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : user.role === "shipper"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : user.role === "warehouse"
                                  ? "bg-pink-100 text-pink-800 border-pink-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                        } border`}
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="seller">Người bán</option>
                        <option value="shipper">Người giao hàng</option>
                        <option value="warehouse">Quản lý kho</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {user.orders}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleToggleLock(user._id)}
                            className={`p-1.5 rounded-lg transition-colors ${user.status === "active" ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-red-500 hover:text-green-600 hover:bg-green-50"}`}
                            title={
                              user.status === "active"
                                ? "Khóa người dùng"
                                : "Mở khóa người dùng"
                            }
                          >
                            {user.status === "active" ? (
                              <LockIcon className="h-4 w-4" />
                            ) : (
                              <UnlockIcon className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào phù hợp với tiêu chí đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Hiển thị từ{" "}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              đến{" "}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * pageSize, filteredUsers.length)}
              </span>{" "}
              trên{" "}
              <span className="font-medium text-gray-900">
                {filteredUsers.length}
              </span>{" "}
              kết quả
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                Chi tiết người dùng
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <img
                  src={
                    selectedUser.avatar ||
                    `https://ui-avatars.com/api/?name=${selectedUser.name}&background=6366f1&color=fff&size=150`
                  }
                  alt={selectedUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center space-x-3 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        selectedUser.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : selectedUser.role === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : selectedUser.role === "shipper"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedUser.role === "warehouse"
                                ? "bg-pink-100 text-pink-800"
                                : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {selectedUser.role === "admin"
                        ? "Quản trị viên"
                        : selectedUser.role === "seller"
                          ? "Người bán"
                          : selectedUser.role === "shipper"
                            ? "Người giao hàng"
                            : selectedUser.role === "warehouse"
                              ? "Quản lý kho"
                              : "Khách hàng"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        selectedUser.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.status === "active" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                  Thông tin liên hệ
                </h5>
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                  <div className="flex items-center text-sm">
                    <MailIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">
                      {selectedUser.phone || "Chưa cập nhật SĐT"}
                    </span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <span className="text-gray-700">
                      {selectedUser.address || "Chưa cập nhật địa chỉ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Info */}
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                  Hoạt động
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <div className="flex items-center text-indigo-400 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Ngày tham gia
                      </span>
                    </div>
                    <p className="font-bold text-indigo-900 text-sm">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                  <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                    <div className="flex items-center text-pink-400 mb-1">
                      <ShoppingBagIcon className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Số đơn hàng
                      </span>
                    </div>
                    <p className="font-bold text-pink-900 text-sm">
                      {selectedUser.orders}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
