import React, { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { StatusBadge } from "../../components/StatusBadge";
import {
  SearchIcon,
  FilterIcon,
  EyeIcon,
  ChevronDownIcon,
  PrinterIcon,
} from "lucide-react";
import { SELLER_SIDEBAR, WAREHOUSE_SIDEBAR } from "../../constants/sidebar";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const orderStatusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returned: "Trả hàng",
};

// Replaced mock data with real data fetch

export function SellerOrders() {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const isWarehouse = user?.role === "warehouse";
  const sidebarItems = isWarehouse ? WAREHOUSE_SIDEBAR : SELLER_SIDEBAR;
  const roleName = isWarehouse ? "Warehouse" : "Seller";

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const handleExportOrders = async () => {
    try {
      const { exportOrdersToExcel } = await import("../../utils/excelExport");
      await exportOrdersToExcel(orders);
    } catch (error) {
      console.error("Error exporting orders", error);
    }
  };

  const printInvoice = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const productsHtml = order.products
      ?.map(
        (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product?.name || "Sản phẩm"} - ${item.variantName || "Default"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.quantity)}</td>
      </tr>
    `,
      )
      .join("");

    const htmlContent = `
      <html>
        <head>
          <title>Hóa đơn ${order._id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 20px; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-size: 28px; font-weight: bold; color: #4F46E5; }
            .info-sec { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box h4 { margin: 0 0 10px 0; color: #666; font-size: 14px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f9fafb; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #ddd; }
            .total { text-align: right; font-size: 20px; font-weight: bold; color: #4F46E5; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="title">${settings.siteName}</div>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">Hệ thống bán lẻ thiết bị điện tử</div>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 20px;">HÓA ĐƠN BÁN HÀNG</h2>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">Mã đơn: #${order._id}</div>
                <div style="font-size: 14px; color: #666;">Ngày: ${new Date(order.createdAt).toLocaleString("vi-VN")}</div>
              </div>
            </div>
            
            <div class="info-sec">
              <div class="info-box">
                <h4>Thông tin khách hàng</h4>
                <strong>${order.customer?.name || "N/A"}</strong><br/>
                SĐT: ${order.customer?.phone || "N/A"}<br/>
                Email: ${order.customer?.email || "N/A"}<br/>
                Địa chỉ: ${order.shippingAddress || "N/A"}
              </div>
              <div class="info-box" style="text-align: right;">
                <h4>Hình thức thanh toán</h4>
                <strong>${order.paymentMethod}</strong><br/>
                Trạng thái: ${order.paymentStatus === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}<br/>
                Vận chuyển: ${orderStatusLabels[order.orderStatus?.toLowerCase()] || order.orderStatus}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th style="text-align: center;">Số lượng</th>
                  <th style="text-align: right;">Đơn giá</th>
                  <th style="text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
            </table>

            <div class="total">
              Tổng cộng: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount || 0)}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
  };

  const [shippers, setShippers] = useState<any[]>([]);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");

  const fetchShippers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/shippers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setShippers(data || []);
      }
    } catch (error) {
      console.error("Error fetching shippers", error);
    }
  };

  React.useEffect(() => {
    fetchShippers();
  }, []);

  const handleAssignShipperAndShip = async () => {
    if (!shippingOrderId || !selectedShipperId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${shippingOrderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "shipped",
            shipperId: selectedShipperId,
          }),
        },
      );

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(
          orders.map((order) =>
            order._id === shippingOrderId ? updatedOrder : order,
          ),
        );
        alert("Đã chuyển giao đơn hàng cho shipper thành công!");
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error assigning shipper", error);
      alert("Lỗi kết nối khi cập nhật shipper");
    } finally {
      setShippingOrderId(null);
      setSelectedShipperId("");
    }
  };

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL}/api/orders/seller?page=${page}&limit=5&status=${activeTab}&search=${searchQuery}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.totalOrders || 0);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Luôn reset về trang 1 khi thay đổi bộ lọc hoặc từ khóa tìm kiếm
    setPage(1);
  }, [activeTab, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300); // Debounce search request
    return () => clearTimeout(timer);
  }, [page, activeTab, searchQuery]);

  const tabs = [
    {
      id: "all",
      label: "Tất cả đơn hàng",
    },
    {
      id: "pending",
      label: "Chờ thanh toán",
    },
    {
      id: "processing",
      label: "Đang xử lý",
    },
    {
      id: "shipped",
      label: "Đang giao hàng",
    },
    {
      id: "delivered",
      label: "Đã giao",
    },
    {
      id: "cancelled",
      label: "Đã hủy",
    },
  ];

  // Local filtering is removed in favor of backend filtering

  const handleStatusChange = async (
    orderId: string,
    payload: { status?: string; paymentStatus?: string },
  ) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(
          orders.map((order) => (order._id === orderId ? updatedOrder : order)),
        );
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
    setOpenDropdownId(null);
  };
  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Đơn hàng"
      role={roleName}
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng (ID, Khách hàng)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        {/* <button
          onClick={handleExportOrders}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto"
        >
          Xuất báo cáo
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
        <div className="overflow-x-auto relative z-10 min-h-[300px]">
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
                  Số sản phẩm
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thanh toán
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Đang tải đơn hàng...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 font-mono"
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.name || "Khách hàng không xác định"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.products?.reduce(
                        (sum: number, p: any) => sum + p.quantity,
                        0,
                      ) || 0}{" "}
                      sản phẩm
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.totalAmount || 0)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1.5 rounded-full text-xs font-bold ${
                          order.paymentStatus === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.paymentStatus === "completed"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-1 items-start">
                        <StatusBadge status={order.orderStatus as any} />
                        {order.shipper && (
                          <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-md mt-1 shrink-0 whitespace-nowrap">
                            Shipper: {order.shipper.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {(user?.role === "seller"
                          ? order.orderStatus !== "cancelled"
                          : !(
                              order.orderStatus === "delivered" ||
                              order.orderStatus === "cancelled" ||
                              order.orderStatus === "returned"
                            )) && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === order._id
                                    ? null
                                    : order._id,
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <span>Cập nhật</span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>

                            {openDropdownId === order._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-10">
                                {user?.role === "seller" ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(order._id, {
                                          paymentStatus: "completed",
                                        })
                                      }
                                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${order.paymentStatus === "completed" ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-gray-700"}`}
                                    >
                                      Đã thanh toán
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(order._id, {
                                          paymentStatus: "pending",
                                        })
                                      }
                                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${order.paymentStatus === "pending" ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-gray-700"}`}
                                    >
                                      Chờ thanh toán
                                    </button>
                                    {order.orderStatus !== "cancelled" && (
                                      <button
                                        onClick={() =>
                                          handleStatusChange(order._id, {
                                            status: "cancelled",
                                          })
                                        }
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        Hủy đơn hàng
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  (user?.role === "warehouse"
                                    ? ["pending", "processing", "shipped"]
                                    : [
                                        "pending",
                                        "processing",
                                        "shipped",
                                        "cancelled",
                                      ]
                                  ).map((status) => (
                                    <button
                                      key={status}
                                      onClick={() => {
                                        if (status === "shipped") {
                                          setShippingOrderId(order._id);
                                          setOpenDropdownId(null);
                                        } else {
                                          handleStatusChange(order._id, {
                                            status,
                                          });
                                        }
                                      }}
                                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${order.orderStatus === status ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-gray-700"}`}
                                    >
                                      {orderStatusLabels[
                                        status?.toLowerCase()
                                      ] || status}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => printInvoice(order)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="In hóa đơn"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
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
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào phù hợp với tiêu chí đã chọn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div className="relative z-0 px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Hiển thị từ{" "}
              <span className="font-medium text-gray-900">
                {(page - 1) * 5 + 1}
              </span>{" "}
              đến{" "}
              <span className="font-medium text-gray-900">
                {Math.min(page * 5, totalOrders)}
              </span>{" "}
              trên{" "}
              <span className="font-medium text-gray-900">{totalOrders}</span>{" "}
              kết quả
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Trước
              </button>

              <div className="flex items-center px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-inner">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Thông tin đơn hàng
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">ID:</span>{" "}
                      <span className="font-medium">{selectedOrder._id}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Ngày đặt:</span>{" "}
                      <span className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString(
                          "vi-VN",
                        )}
                      </span>
                    </p>
                    <div className="text-sm flex items-center space-x-1.5">
                      <span className="text-gray-500">Trạng thái:</span>{" "}
                      <StatusBadge status={selectedOrder.orderStatus as any} />
                    </div>
                    <p className="text-sm">
                      <span className="text-gray-500">Thanh toán:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder.paymentMethod} (
                        {selectedOrder.paymentStatus === "completed"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                        )
                      </span>
                    </p>
                    {selectedOrder.shipper && (
                      <p className="text-sm">
                        <span className="text-gray-500">Shipper:</span>{" "}
                        <span className="font-medium">
                          {selectedOrder.shipper.name} (
                          {selectedOrder.shipper.phone || "Chưa cập nhật SĐT"})
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Thông tin khách hàng
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {selectedOrder.customer?.name || "Không xác định"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.customer?.phone}
                    </p>
                    <p
                      className="text-sm text-gray-600 mt-2 line-clamp-2"
                      title={selectedOrder.shippingAddress}
                    >
                      <span className="text-gray-500">Địa chỉ:</span>{" "}
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Danh sách sản phẩm
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Sản phẩm</th>
                        <th className="px-4 py-3 font-medium text-center">
                          Số lượng
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Đơn giá
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.products?.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <img
                              src={
                                item.product?.images?.[0] ||
                                "https://via.placeholder.com/40"
                              }
                              alt="product"
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                            <div>
                              <span className="font-medium text-gray-900 line-clamp-1">
                                {item.product?.name || "Sản phẩm"}
                              </span>
                              {item.variantName &&
                                item.variantName !== "Default" && (
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                    Biến thể: {item.variantName}
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              {(() => {
                const subtotal =
                  selectedOrder.products?.reduce(
                    (sum: number, p: any) => sum + p.price * p.quantity,
                    0,
                  ) || 0;
                const discount = subtotal - (selectedOrder.totalAmount || 0);
                return (
                  <div className="bg-indigo-50/50 rounded-xl p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-bold text-gray-900">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(subtotal)}
                      </span>
                    </div>
                    {selectedOrder.coupon && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mã giảm giá đã áp</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono text-xs">
                          {selectedOrder.coupon}
                        </span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Số tiền giảm</span>
                        <span>
                          -
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Hình thức thanh toán
                      </span>
                      <span className="font-bold text-gray-900 uppercase">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center rounded-b-2xl">
              <button
                onClick={() => printInvoice(selectedOrder)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                In hóa đơn
              </button>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-500 uppercase tracking-wider text-sm">
                  Tổng tiền
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedOrder.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {shippingOrderId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Chọn nhân viên giao hàng (Shipper)
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Vui lòng chọn một shipper hoạt động để bàn giao đơn hàng #
              {shippingOrderId.substring(0, 8).toUpperCase()}.
            </p>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-semibold text-gray-700">
                Nhân viên giao hàng
              </label>
              <select
                value={selectedShipperId}
                onChange={(e) => setSelectedShipperId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">-- Chọn Shipper --</option>
                {shippers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.phone || "Không có SĐT"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShippingOrderId(null);
                  setSelectedShipperId("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 text-sm transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignShipperAndShip}
                disabled={!selectedShipperId}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 text-sm transition-all shadow-md active:scale-95"
              >
                Xác nhận & Giao hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
