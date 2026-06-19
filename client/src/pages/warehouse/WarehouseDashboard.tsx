import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { WAREHOUSE_SIDEBAR } from "../../constants/sidebar";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import {
  SearchIcon,
  PrinterIcon,
  PackageIcon,
  ShoppingBagIcon,
  LayersIcon,
  TrendingUpIcon,
} from "lucide-react";

export function WarehouseDashboard() {
  const { settings } = useSiteSettings();
  const [productsList, setProductsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await res.json();
      setProductsList(data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = productsList.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku &&
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Helper to calculate total stock (taking variants into account)
  const getProductStock = (p: any) => {
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      return p.variants.reduce(
        (sum: number, v: any) => sum + Math.max(0, Number(v.stock) || 0),
        0,
      );
    }
    return Number(p.stock || 0);
  };

  // Stats calculation
  const totalProducts = productsList.length;
  const totalStock = productsList.reduce(
    (sum, p) => sum + getProductStock(p),
    0,
  );
  const totalSales = productsList.reduce(
    (sum, p) => sum + Number(p.sales || 0),
    0,
  );
  const totalImport = totalStock + totalSales;

  const printPdfReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rowsHtml = filteredProducts
      .map((p: any) => {
        const stock = getProductStock(p);
        const sales = Number(p.sales || 0);
        const imported = stock + sales;
        const date = new Date(p.createdAt).toLocaleDateString("vi-VN");

        const variantsText =
          Array.isArray(p.variants) && p.variants.length > 0
            ? p.variants
                .map((v: any) => `${v.name} (Tồn: ${v.stock})`)
                .join(", ")
            : "Không có";

        return `
        <tr>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">${p.sku || "N/A"}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb;">
            <div style="font-weight: 600; color: #111827;">${p.name}</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Biến thể: ${variantsText}</div>
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${imported}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 500;">${sales}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600; color: ${stock === 0 ? "#dc2626" : "#1f2937"};">${stock}</td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${date}</td>
        </tr>
      `;
      })
      .join("");

    const htmlContent = `
      <html>
        <head>
          <title>Báo cáo tổng quan kho sản phẩm</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 40px; }
            .report-header { text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 24px; margin-bottom: 32px; }
            .title { font-size: 26px; font-weight: 800; color: #4f46e5; letter-spacing: -0.025em; }
            .metadata { font-size: 13px; color: #4b5563; margin-top: 6px; }
            .summary-cards { display: grid; grid-template-cols: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .card { border: 1px solid #e5e7eb; padding: 18px; border-radius: 12px; text-align: center; background: #fafafa; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .card-title { font-size: 11px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
            .card-value { font-size: 22px; font-weight: 800; color: #111827; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #4f46e5; color: white; padding: 14px 10px; text-align: left; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            td { font-size: 13px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="title">BÁO CÁO TỒNG QUAN HÀNG TỒN KHO & NHẬP XUẤT</div>
            <div class="metadata">Hệ thống ${settings.siteName} • Ngày xuất báo cáo: ${new Date().toLocaleString("vi-VN")}</div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Tổng loại sản phẩm</div>
              <div class="card-value">${totalProducts}</div>
            </div>
            <div class="card">
              <div class="card-title">Tổng số lượng nhập</div>
              <div class="card-value">${totalImport}</div>
            </div>
            <div class="card">
              <div class="card-title">Tổng số lượng bán</div>
              <div class="card-value">${totalSales}</div>
            </div>
            <div class="card">
              <div class="card-title">Tổng số tồn kho</div>
              <div class="card-value">${totalStock}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Mã SKU</th>
                <th style="width: 45%;">Tên sản phẩm</th>
                <th style="width: 10%; text-align: center;">Số lượng nhập</th>
                <th style="width: 10%; text-align: center;">Đã bán</th>
                <th style="width: 10%; text-align: center;">Tồn kho</th>
                <th style="width: 10%; text-align: center;">Ngày nhập</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
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
    printWindow.document.close();
  };

  return (
    <DashboardLayout
      sidebarItems={WAREHOUSE_SIDEBAR}
      title="Tổng quan sản phẩm & tồn kho"
      role="Warehouse"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <PackageIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Sản phẩm
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">
            Tổng loại sản phẩm
          </h3>
          <p className="text-3xl font-extrabold text-gray-900">
            {loading ? "..." : totalProducts}
          </p>
        </div>

        {/* Total Import */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
              <LayersIcon className="h-6 w-6 text-pink-600" />
            </div>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
              Tổng nhập
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">
            Tổng số lượng nhập
          </h3>
          <p className="text-3xl font-extrabold text-gray-900">
            {loading ? "..." : totalImport}
          </p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <ShoppingBagIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              Đã bán
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">
            Tổng số lượng bán
          </h3>
          <p className="text-3xl font-extrabold text-gray-900">
            {loading ? "..." : totalSales}
          </p>
        </div>

        {/* Current Stock */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <TrendingUpIcon className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Hiện tồn
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-500 mb-1">
            Tổng hàng tồn kho
          </h3>
          <p className="text-3xl font-extrabold text-gray-900">
            {loading ? "..." : totalStock}
          </p>
        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={printPdfReport}
            disabled={filteredProducts.length === 0}
            className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-indigo-100"
          >
            <PrinterIcon className="h-4.5 w-4.5 mr-2" />
            Xuất file PDF / In báo cáo
          </button>
        </div>

        {/* Inventory List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mã SKU
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm & Biến thể
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Tổng nhập
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Số lượng bán
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Hiện tồn
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                  Ngày nhập kho
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Đang tải dữ liệu sản phẩm kho...
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const stock = getProductStock(p);
                  const sales = Number(p.sales || 0);
                  const imported = stock + sales;
                  const date = new Date(p.createdAt).toLocaleDateString(
                    "vi-VN",
                  );

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="p-4 text-sm font-mono text-gray-500">
                        {p.sku || "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              p.images && p.images.length > 0
                                ? p.images[0]
                                : "https://via.placeholder.com/150"
                            }
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {p.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              Biến thể:{" "}
                              {Array.isArray(p.variants) &&
                              p.variants.length > 0
                                ? p.variants
                                    .map((v: any) => `${v.name} (${v.stock})`)
                                    .join(", ")
                                : "Không có"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 text-center font-medium">
                        {imported}
                      </td>
                      <td className="p-4 text-sm text-green-600 text-center font-semibold">
                        {sales}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-sm font-bold ${stock === 0 ? "text-red-600 bg-red-50 px-2 py-1 rounded-lg" : stock < 10 ? "text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg" : "text-gray-900 bg-gray-50 px-2 py-1 rounded-lg"}`}
                        >
                          {stock}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 text-center">
                        {date}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào trong kho.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
