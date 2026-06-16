import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { StatusBadge } from "../../components/StatusBadge";
import {
  UsersIcon,
  PackageIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  DownloadIcon,
  MapPinIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react";

import { ADMIN_SIDEBAR } from "../../constants/sidebar";
import { formatVND } from "../../utils/format";

export function AdminOrders() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setOrdersList(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);
  const tabs = [
    {
      id: "all",
      label: "Tất cả đơn",
    },
    {
      id: "pending",
      label: "Chờ thanh toán",
    },
    {
      id: "processing",
      label: "Chờ giao hàng",
    },
    {
      id: "shipping",
      label: "Đang giao",
    },
    {
      id: "delivered",
      label: "Đã giao thành công",
    },
    {
      id: "cancelled",
      label: "Đã hủy",
    },
  ];

  const filteredOrders = ordersList.filter((order) => {
    const matchesTab = activeTab === "all" || order.orderStatus === activeTab;
    const customerName = order.customer?.name || "";
    const sellerName = order.seller?.name || "";
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Đơn hàng hệ thống"
      role="Admin"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng (ID, Khách hàng, Người bán)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        {/* <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Orders
        </button> */}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === tab.id ? "text-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Người bán
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng cộng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.name || "Không xác định"}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {order.seller?.name || "ShopHub"}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus as any} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào phù hợp với tiêu chí đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Hiển thị từ{" "}
              <span className="font-medium text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              đến{" "}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * pageSize, filteredOrders.length)}
              </span>{" "}
              trên{" "}
              <span className="font-medium text-gray-900">
                {filteredOrders.length}
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

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Chi tiết đơn hàng
                </h3>
                <p className="text-sm text-gray-500 font-mono">
                  #{selectedOrderDetails._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Timeline Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Trạng thái hiện tại
                </h4>
                <div className="flex items-center space-x-4">
                  <StatusBadge
                    status={selectedOrderDetails.orderStatus as any}
                  />
                  <span className="text-sm text-gray-500">
                    Cập nhật lúc:{" "}
                    {new Date(selectedOrderDetails.updatedAt).toLocaleString(
                      "vi-VN",
                    )}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Địa chỉ giao hàng
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-start text-sm">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-700">
                        {selectedOrderDetails.shippingAddress}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedOrderDetails.customer?.phone ||
                          "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Người mua & Người bán
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        Khách:{" "}
                        <span className="font-bold text-gray-900">
                          {selectedOrderDetails.customer?.name}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <PackageIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        Host:{" "}
                        <span className="font-medium text-gray-900">
                          {selectedOrderDetails.seller?.name || "ShopHub"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Sản phẩm
                </h4>
                <div className="space-y-3">
                  {selectedOrderDetails.products.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-4 bg-white border border-gray-100 rounded-xl p-3"
                    >
                      <img
                        src={
                          p.product?.images?.[0] ||
                          "https://via.placeholder.com/150"
                        }
                        className="w-14 h-14 rounded-lg object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {p.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Sl: {p.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatVND(p.price * p.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-indigo-50/50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hình thức thanh toán</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {selectedOrderDetails.paymentMethod}
                  </span>
                </div>
                {selectedOrderDetails.coupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã giảm giá</span>
                    <span className="font-bold text-green-600">
                      {selectedOrderDetails.coupon}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-indigo-100 border-dashed flex justify-between">
                  <span className="font-bold text-gray-900">
                    Tổng thanh toán
                  </span>
                  <span className="text-xl font-black text-red-600">
                    {formatVND(selectedOrderDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedOrderDetails(null)}
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
