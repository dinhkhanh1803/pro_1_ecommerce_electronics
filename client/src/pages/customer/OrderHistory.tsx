import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CustomerLayout } from "../../components/CustomerLayout";
import { StatusBadge } from "../../components/StatusBadge";
import {
  ChevronRightIcon,
  PackageIcon,
  CalendarIcon,
  WalletIcon,
  SearchIcon,
  MessageSquareIcon,
  MapPinIcon,
  PhoneIcon,
  XIcon,
} from "lucide-react";

import { formatVND } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

export function OrderHistory() {
  const { showConfirm } = useToast();
  const { settings } = useSiteSettings();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);

  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn hủy đơn hàng này không?", { confirmLabel: "Hủy đơn" });
    if (!confirmed) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        alert("Hủy đơn hàng thành công");
        fetchOrders();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi hủy đơn hàng");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === "all" || order.orderStatus === activeFilter;
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.products.some((p: any) =>
        p.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ duyệt" },
    { id: "processing", label: "Xử lý" },
    { id: "shipped", label: "Đang giao" },
    { id: "delivered", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  return (
    <CustomerLayout title="Lịch sử đơn hàng">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-between">
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeFilter === filter.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn/sản phẩm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">
              Đang tải lịch sử đơn hàng...
            </p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-indigo-50/50 transition-all group"
            >
              {/* Order Header */}
              <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Mã đơn hàng
                    </p>
                    <p className="text-sm font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded-lg border border-gray-100 italic shadow-sm hover:text-indigo-600 transition-colors">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Ngày đặt
                    </p>
                    <div className="flex items-center text-sm font-bold text-gray-700">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                      Trạng thái
                    </p>
                    <StatusBadge status={order.orderStatus as any} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={
                        order.seller && order.seller.role !== "admin"
                          ? `/chat?contactId=${order.seller._id}&orderId=${order._id}`
                          : `/chat?orderId=${order._id}`
                      }
                      className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all shadow-sm border border-indigo-100 flex items-center space-x-2"
                      title="Chat với người bán"
                    >
                      <MessageSquareIcon className="h-4 w-4" />
                      <span className="text-xs font-bold hidden sm:inline">
                        Trò chuyện
                      </span>
                    </Link>
                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="p-2.5 bg-white text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-gray-100"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {["pending", "processing"].includes(order.orderStatus) && (
                    <div className="w-full sm:w-auto mt-3 sm:mt-0 text-right">
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.products.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-5">
                      <div className="relative">
                        <img
                          src={
                            p.product?.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
                        />
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                          {p.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors pointer-events-none">
                          {p.product?.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Đơn giá: {formatVND(p.price)}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {formatVND(p.price * p.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-indigo-50/30 rounded-2xl border border-indigo-50">
                  <div className="flex items-center text-sm font-semibold text-gray-500 mb-2 sm:mb-0">
                    <WalletIcon className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>
                      Thanh toán:{" "}
                      <span className="text-gray-900 font-bold uppercase">
                        {order.paymentMethod}
                      </span>
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus === "completed"
                        ? "Đã Thanh Toán"
                        : order.paymentStatus === "failed"
                          ? "Thất Bại"
                          : "Chưa Thanh Toán"}
                    </span>
                    {/* <span className="mx-3 text-indigo-200">|</span> */}
                    {/* <span>Cửa hàng: <span className="text-indigo-600 font-bold italic">{order.seller?.name || settings.siteName}</span></span> */}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mr-3">
                      Tổng cộng
                    </span>
                    <span className="text-xl font-black text-red-600 drop-shadow-sm">
                      {formatVND(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 mb-6 group-hover:scale-110 transition-transform">
              <PackageIcon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Chưa tìm thấy đơn hàng nào
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
              Có vẻ như bạn chưa có đơn hàng nào ở trạng thái này hoặc từ khóa
              tìm kiếm không khớp.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Bắt đầu mua sắm ngay
            </Link>
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
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                  <p>
                    Mã đơn:{" "}
                    <span className="font-mono">
                      {selectedOrderDetails._id}
                    </span>
                  </p>
                  <p>
                    Thời gian đặt:{" "}
                    {new Date(selectedOrderDetails.createdAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Timeline mockup */}
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
                    Cửa hàng
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <PackageIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {selectedOrderDetails.seller?.name || settings.siteName}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageSquareIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedOrderDetails.seller?.email ||
                          settings.supportEmail}
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
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500 font-medium">
                            Sl: {p.quantity}
                          </span>
                          {p.variantName && p.variantName !== "Default" && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                              Biến thể: {p.variantName}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatVND(p.price * p.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {(() => {
                const subtotal = selectedOrderDetails.products.reduce(
                  (sum: number, p: any) => sum + p.price * p.quantity,
                  0,
                );
                const discount = subtotal - selectedOrderDetails.totalAmount;
                return (
                  <div className="bg-indigo-50/50 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-bold text-gray-900">
                        {formatVND(subtotal)}
                      </span>
                    </div>
                    {selectedOrderDetails.coupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mã giảm giá đã áp</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono text-xs">
                          {selectedOrderDetails.coupon}
                        </span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Số tiền giảm</span>
                        <span>-{formatVND(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Hình thức thanh toán
                      </span>
                      <span className="font-bold text-gray-900">
                        {selectedOrderDetails.paymentMethod}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-indigo-100 border-dashed flex justify-between">
                      <span className="font-bold text-gray-900">
                        Tổng thanh toán
                      </span>
                      <span className="text-xl font-black text-red-600">
                        {formatVND(selectedOrderDetails.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
