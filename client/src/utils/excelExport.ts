// @ts-ignore
import ExcelJS from 'exceljs/dist/exceljs.min.js';

const borderStyle: any = {
  top: { style: 'thin', color: { argb: 'E5E7EB' } },
  left: { style: 'thin', color: { argb: 'E5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
  right: { style: 'thin', color: { argb: 'E5E7EB' } }
};

const applyZebraAndBorders = (sheet: any, startRow: number, endRow: number, maxCol: number, lightHex: string) => {
  for (let r = startRow; r < endRow; r++) {
    for (let c = 1; c <= maxCol; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = borderStyle;
      if ((r - startRow) % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightHex } };
      }
    }
  }
};

const autofitColumns = (sheet: any) => {
  sheet.columns.forEach((column: any) => {
    let maxLen = 0;
    column.eachCell({ includeEmpty: true }, (cell: any) => {
      const value = cell.value ? cell.value.toString() : '';
      if (value.length > maxLen) maxLen = value.length;
    });
    column.width = Math.max(maxLen + 4, 15);
  });
};

export async function exportAdminDashboardToExcel(stats: any, siteName: string = 'ShopHub') {
  const workbook = new ExcelJS.Workbook();
  
  // ==========================================
  // SHEET 1: BÁO CÁO TỔNG QUAN
  // ==========================================
  const sheetTongQuan = workbook.addWorksheet('Báo cáo tổng quan');
  sheetTongQuan.views = [{ showGridLines: true }];

  // 1. Title Block
  sheetTongQuan.mergeCells('A1:G2');
  const titleCell = sheetTongQuan.getCell('A1');
  titleCell.value = `BÁO CÁO TỔNG QUAN HỆ THỐNG - ${siteName.toUpperCase()}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }; // Indigo-600
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 2. Metadata (Export date)
  sheetTongQuan.getCell('A4').value = 'Ngày xuất báo cáo:';
  sheetTongQuan.getCell('A4').font = { bold: true };
  sheetTongQuan.getCell('B4').value = new Date().toLocaleString('vi-VN');

  // 3. Metric Summary Table
  sheetTongQuan.getCell('A6').value = 'BẢNG SỐ LIỆU TỔNG QUAN';
  sheetTongQuan.getCell('A6').font = { size: 12, bold: true, color: { argb: '1E1B4B' } }; // Dark indigo

  const metricsHeaders = ['Chỉ số', 'Giá trị', 'Chi tiết thêm'];
  const headerRow = sheetTongQuan.getRow(8);
  metricsHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '312E81' } }; // Indigo-900
    cell.alignment = { horizontal: 'left' };
  });

  const metricsData = [
    ['Tổng người dùng', stats.totalUsers || 0, `${stats.totalSellers || 0} Người bán • ${(stats.totalUsers || 0) - (stats.totalSellers || 0)} Khách hàng`],
    ['Tổng sản phẩm', (stats.activeProducts || 0) + (stats.pendingProducts || 0), `${stats.activeProducts || 0} Đang hoạt động • ${stats.pendingProducts || 0} Chờ duyệt`],
    ['Doanh thu hệ thống', stats.revenue || 0, 'Hoa hồng hệ thống (5% đơn hàng delivered)'],
    ['Tổng đơn hàng', stats.totalOrders || 0, `${stats.totalOrders || 0} Đơn hàng trong chu kỳ lọc`]
  ];

  metricsData.forEach((row, idx) => {
    const r = sheetTongQuan.getRow(9 + idx);
    r.getCell(1).value = row[0];
    r.getCell(2).value = row[1];
    r.getCell(3).value = row[2];

    r.getCell(1).font = { bold: true };
    r.getCell(2).numFmt = row[0] === 'Doanh thu hệ thống' ? '#,##0" ₫"' : '#,##0';
    r.getCell(2).alignment = { horizontal: 'left' };
  });

  for (let r = 8; r <= 12; r++) {
    for (let c = 1; c <= 3; c++) {
      sheetTongQuan.getCell(r, c).border = borderStyle;
    }
  }

  // 4. Detailed Revenue Report Table
  sheetTongQuan.getCell('A14').value = 'BIỂU ĐỒ DOANH THU & ĐƠN HÀNG CHI TIẾT THEO NGÀY';
  sheetTongQuan.getCell('A14').font = { size: 12, bold: true, color: { argb: '1E1B4B' } };

  const revenueHeaders = ['Thời gian / Ngày', 'Doanh thu', 'Số đơn hàng'];
  const revHeaderRow = sheetTongQuan.getRow(16);
  revenueHeaders.forEach((h, i) => {
    const cell = revHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } }; // Emerald-600
    cell.alignment = { horizontal: 'left' };
  });

  const revenueData = stats.revenueData || [];
  let currentExcelRow = 17;
  revenueData.forEach((item: any, idx: number) => {
    const r = sheetTongQuan.getRow(currentExcelRow);
    r.getCell(1).value = item.name || '';
    r.getCell(2).value = item.revenue || 0;
    r.getCell(3).value = item.orders || 0;

    r.getCell(2).numFmt = '#,##0" ₫"';
    r.getCell(3).numFmt = '#,##0';
    r.getCell(2).alignment = { horizontal: 'left' };
    r.getCell(3).alignment = { horizontal: 'left' };
    
    // Zebra striping
    if (idx % 2 === 1) {
      r.eachCell((cell: any) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } }; // Light emerald
      });
    }
    currentExcelRow++;
  });

  for (let r = 16; r < currentExcelRow; r++) {
    for (let c = 1; c <= 3; c++) {
      sheetTongQuan.getCell(r, c).border = borderStyle;
    }
  }

  // 5. Embed the Chart Image
  try {
    const svgElement = document.querySelector('.recharts-responsive-container svg');
    if (svgElement) {
      const imgBuffer = await convertSvgToPngBuffer(svgElement);
      if (imgBuffer) {
        const imageId = workbook.addImage({
          buffer: imgBuffer,
          extension: 'png',
        });
        sheetTongQuan.addImage(imageId, {
          tl: { col: 4, row: 4 },
          ext: { width: 550, height: 320 }
        });
      }
    }
  } catch (error) {
    console.error('Error rendering chart to Excel', error);
  }

  autofitColumns(sheetTongQuan);

  // ==========================================
  // SHEET 2: DOANH THU & HOA HỒNG HỆ THỐNG
  // ==========================================
  const sheetDoanhThu = workbook.addWorksheet('Doanh thu & Hoa hồng');
  sheetDoanhThu.views = [{ showGridLines: true }];
  
  // Sheet Header Title
  sheetDoanhThu.mergeCells('A1:G1');
  const dtTitleCell = sheetDoanhThu.getCell('A1');
  dtTitleCell.value = 'BÁO CÁO DOANH THU & HOA HỒNG CHI TIẾT (5% ĐƠN DELIVERED)';
  dtTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  dtTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } }; // Emerald-600
  dtTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetDoanhThu.getRow(1).height = 30;

  // Metadata
  sheetDoanhThu.getCell('A3').value = 'Ngày xuất báo cáo:';
  sheetDoanhThu.getCell('A3').font = { bold: true };
  sheetDoanhThu.getCell('B3').value = new Date().toLocaleString('vi-VN');

  // Headers
  const dtHeaders = ['Mã Đơn Hàng', 'Khách Hàng', 'Tổng Tiền Đơn', 'Hoa Hồng (5%)', 'Thanh Toán', 'Ngày Đặt'];
  const dtHeaderRow = sheetDoanhThu.getRow(5);
  dtHeaderRow.height = 24;
  dtHeaders.forEach((h, i) => {
    const cell = dtHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '047857' } }; // Emerald-700
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  const ordersList = stats.ordersList || [];
  const deliveredOrders = ordersList.filter((o: any) => o.orderStatus === 'delivered');

  let dtCurrentRow = 6;
  let totalOrderAmount = 0;
  let totalCommission = 0;

  deliveredOrders.forEach((o: any) => {
    const r = sheetDoanhThu.getRow(dtCurrentRow);
    r.height = 20;
    r.getCell(1).value = o._id.toString().slice(-8).toUpperCase();
    r.getCell(2).value = o.customer?.name || 'N/A';
    r.getCell(3).value = o.totalAmount || 0;
    r.getCell(4).value = (o.totalAmount || 0) * 0.05;
    r.getCell(5).value = o.paymentMethod || 'COD';
    r.getCell(6).value = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'N/A';

    r.getCell(3).numFmt = '#,##0" ₫"';
    r.getCell(4).numFmt = '#,##0" ₫"';
    r.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };

    totalOrderAmount += o.totalAmount || 0;
    totalCommission += (o.totalAmount || 0) * 0.05;

    dtCurrentRow++;
  });

  applyZebraAndBorders(sheetDoanhThu, 5, dtCurrentRow, 6, 'F0FDF4');

  // Summary row
  const dtSummaryRow = sheetDoanhThu.getRow(dtCurrentRow);
  dtSummaryRow.height = 22;
  dtSummaryRow.getCell(1).value = 'TỔNG CỘNG';
  dtSummaryRow.getCell(1).font = { bold: true, color: { argb: '065F46' } };
  dtSummaryRow.getCell(3).value = totalOrderAmount;
  dtSummaryRow.getCell(3).font = { bold: true, color: { argb: '065F46' } };
  dtSummaryRow.getCell(3).numFmt = '#,##0" ₫"';
  dtSummaryRow.getCell(4).value = totalCommission;
  dtSummaryRow.getCell(4).font = { bold: true, color: { argb: '065F46' } };
  dtSummaryRow.getCell(4).numFmt = '#,##0" ₫"';

  for (let c = 1; c <= 6; c++) {
    dtSummaryRow.getCell(c).border = borderStyle;
    dtSummaryRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
  }

  autofitColumns(sheetDoanhThu);

  // ==========================================
  // SHEET 3: DANH SÁCH ĐƠN HÀNG CHI TIẾT
  // ==========================================
  const sheetDonHang = workbook.addWorksheet('Danh sách đơn hàng');
  sheetDonHang.views = [{ showGridLines: true }];

  // Sheet Header Title
  sheetDonHang.mergeCells('A1:I1');
  const dhTitleCell = sheetDonHang.getCell('A1');
  dhTitleCell.value = 'DANH SÁCH CHI TIẾT ĐƠN HÀNG HỆ THỐNG';
  dhTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  dhTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } }; // Indigo-600
  dhTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetDonHang.getRow(1).height = 30;

  // Metadata
  sheetDonHang.getCell('A3').value = 'Ngày xuất báo cáo:';
  sheetDonHang.getCell('A3').font = { bold: true };
  sheetDonHang.getCell('B3').value = new Date().toLocaleString('vi-VN');

  // Headers
  const dhHeaders = ['Mã Đơn Hàng', 'Khách Hàng', 'Số Lượng SP', 'Tổng Tiền', 'Thanh Toán', 'Trạng Thái TT', 'Trạng Thái ĐH', 'Ngày Đặt'];
  const dhHeaderRow = sheetDonHang.getRow(5);
  dhHeaderRow.height = 24;
  dhHeaders.forEach((h, i) => {
    const cell = dhHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } }; // Indigo-800
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  let dhCurrentRow = 6;
  let dhTotalAmount = 0;

  ordersList.forEach((o: any) => {
    const r = sheetDonHang.getRow(dhCurrentRow);
    r.height = 20;
    r.getCell(1).value = o._id.toString().slice(-8).toUpperCase();
    r.getCell(2).value = o.customer?.name || 'N/A';
    
    const qty = Array.isArray(o.products) ? o.products.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0) : 0;
    r.getCell(3).value = qty;
    r.getCell(4).value = o.totalAmount || 0;
    r.getCell(5).value = o.paymentMethod || 'COD';
    r.getCell(6).value = o.paymentStatus || 'pending';
    r.getCell(7).value = o.orderStatus || 'pending';
    r.getCell(8).value = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : 'N/A';

    r.getCell(3).numFmt = '#,##0';
    r.getCell(4).numFmt = '#,##0" ₫"';
    r.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
    r.getCell(4).alignment = { horizontal: 'left', vertical: 'middle' };

    dhTotalAmount += o.totalAmount || 0;
    dhCurrentRow++;
  });

  applyZebraAndBorders(sheetDonHang, 5, dhCurrentRow, 8, 'EEF2F6');

  // Summary row
  const dhSummaryRow = sheetDonHang.getRow(dhCurrentRow);
  dhSummaryRow.height = 22;
  dhSummaryRow.getCell(1).value = 'TỔNG CỘNG';
  dhSummaryRow.getCell(1).font = { bold: true, color: { argb: '1E1B4B' } };
  dhSummaryRow.getCell(4).value = dhTotalAmount;
  dhSummaryRow.getCell(4).font = { bold: true, color: { argb: '1E1B4B' } };
  dhSummaryRow.getCell(4).numFmt = '#,##0" ₫"';

  for (let c = 1; c <= 8; c++) {
    dhSummaryRow.getCell(c).border = borderStyle;
    dhSummaryRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
  }

  autofitColumns(sheetDonHang);

  // ==========================================
  // SHEET 4: TỒN KHO & DANH SÁCH SẢN PHẨM
  // ==========================================
  const sheetTonKho = workbook.addWorksheet('Tồn kho sản phẩm');
  sheetTonKho.views = [{ showGridLines: true }];

  // Sheet Header Title
  sheetTonKho.mergeCells('A1:J1');
  const tkTitleCell = sheetTonKho.getCell('A1');
  tkTitleCell.value = 'BÁO CÁO HÀNG TỒN KHO & BẢNG KÊ SẢN PHẨM';
  tkTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  tkTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0D9488' } }; // Teal-600
  tkTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetTonKho.getRow(1).height = 30;

  // Metadata
  sheetTonKho.getCell('A3').value = 'Ngày xuất báo cáo:';
  sheetTonKho.getCell('A3').font = { bold: true };
  sheetTonKho.getCell('B3').value = new Date().toLocaleString('vi-VN');

  // Headers
  const tkHeaders = ['Mã Sản Phẩm', 'Tên Sản Phẩm', 'SKU', 'Thương Hiệu', 'Danh Mục', 'Giá Bán', 'Tồn Kho', 'Đã Bán', 'Trạng Thái'];
  const tkHeaderRow = sheetTonKho.getRow(5);
  tkHeaderRow.height = 24;
  tkHeaders.forEach((h, i) => {
    const cell = tkHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F766E' } }; // Teal-700
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  const productsList = stats.productsList || [];
  let tkCurrentRow = 6;
  let totalStockVal = 0;
  let totalSalesVal = 0;

  productsList.forEach((p: any) => {
    const r = sheetTonKho.getRow(tkCurrentRow);
    r.height = 20;
    r.getCell(1).value = p._id.toString().slice(-8).toUpperCase();
    r.getCell(2).value = p.name || 'N/A';
    r.getCell(3).value = p.sku || 'N/A';
    r.getCell(4).value = p.brand || 'N/A';
    r.getCell(5).value = p.category?.name || 'N/A';
    r.getCell(6).value = p.price || 0;
    
    const totalVariantStock = Array.isArray(p.variants) && p.variants.length > 0
      ? p.variants.reduce((sum: number, variant: any) => sum + Math.max(0, Number(variant.stock) || 0), 0)
      : (p.stock || 0);

    r.getCell(7).value = totalVariantStock;
    r.getCell(8).value = p.sales || 0;
    r.getCell(9).value = p.status === 'active' ? 'Đang hoạt động' : p.status === 'pending' ? 'Chờ duyệt' : p.status === 'draft' ? 'Nháp' : 'Từ chối';

    r.getCell(6).numFmt = '#,##0" ₫"';
    r.getCell(7).numFmt = '#,##0';
    r.getCell(8).numFmt = '#,##0';
    r.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };
    r.getCell(7).alignment = { horizontal: 'left', vertical: 'middle' };
    r.getCell(8).alignment = { horizontal: 'left', vertical: 'middle' };

    totalStockVal += totalVariantStock;
    totalSalesVal += p.sales || 0;
    tkCurrentRow++;
  });

  applyZebraAndBorders(sheetTonKho, 5, tkCurrentRow, 9, 'F0FDFA');

  // Summary row
  const tkSummaryRow = sheetTonKho.getRow(tkCurrentRow);
  tkSummaryRow.height = 22;
  tkSummaryRow.getCell(1).value = 'TỔNG CỘNG';
  tkSummaryRow.getCell(1).font = { bold: true, color: { argb: '115E59' } };
  tkSummaryRow.getCell(7).value = totalStockVal;
  tkSummaryRow.getCell(7).font = { bold: true, color: { argb: '115E59' } };
  tkSummaryRow.getCell(7).numFmt = '#,##0';
  tkSummaryRow.getCell(8).value = totalSalesVal;
  tkSummaryRow.getCell(8).font = { bold: true, color: { argb: '115E59' } };
  tkSummaryRow.getCell(8).numFmt = '#,##0';

  for (let c = 1; c <= 9; c++) {
    tkSummaryRow.getCell(c).border = borderStyle;
    tkSummaryRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCFBF1' } };
  }

  autofitColumns(sheetTonKho);

  // ==========================================
  // SHEET 5: DANH SÁCH NGƯỜI DÙNG / KHÁCH HÀNG
  // ==========================================
  const sheetKhachHang = workbook.addWorksheet('Danh sách khách hàng');
  sheetKhachHang.views = [{ showGridLines: true }];

  // Sheet Header Title
  sheetKhachHang.mergeCells('A1:G1');
  const khTitleCell = sheetKhachHang.getCell('A1');
  khTitleCell.value = 'DANH SÁCH NGƯỜI DÙNG & KHÁCH HÀNG TRÊN HỆ THỐNG';
  khTitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  khTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }; // Blue-600
  khTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheetKhachHang.getRow(1).height = 30;

  // Metadata
  sheetKhachHang.getCell('A3').value = 'Ngày xuất báo cáo:';
  sheetKhachHang.getCell('A3').font = { bold: true };
  sheetKhachHang.getCell('B3').value = new Date().toLocaleString('vi-VN');

  // Headers
  const khHeaders = ['Tên Người Dùng', 'Email', 'Số Điện Thoại', 'Vai Trò', 'Trạng Thái', 'Xác Thực', 'Ngày Đăng Ký'];
  const khHeaderRow = sheetKhachHang.getRow(5);
  khHeaderRow.height = 24;
  khHeaders.forEach((h, i) => {
    const cell = khHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1D4ED8' } }; // Blue-700
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  const usersList = stats.usersList || [];
  let khCurrentRow = 6;

  usersList.forEach((u: any) => {
    const r = sheetKhachHang.getRow(khCurrentRow);
    r.height = 20;
    r.getCell(1).value = u.name || 'N/A';
    r.getCell(2).value = u.email || 'N/A';
    r.getCell(3).value = u.phone || 'N/A';
    
    const roleMap: any = { admin: 'Quản trị viên', seller: 'Người bán', shipper: 'Giao hàng', warehouse: 'Quản lý kho', customer: 'Khách hàng' };
    r.getCell(4).value = roleMap[u.role] || u.role || 'Khách hàng';
    r.getCell(5).value = u.status === 'active' ? 'Đang hoạt động' : 'Đang khóa';
    r.getCell(6).value = u.verified ? 'Đã xác thực' : 'Chưa xác thực';
    r.getCell(7).value = u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A';

    khCurrentRow++;
  });

  applyZebraAndBorders(sheetKhachHang, 5, khCurrentRow, 7, 'EFF6FF');

  // Summary row
  const khSummaryRow = sheetKhachHang.getRow(khCurrentRow);
  khSummaryRow.height = 22;
  khSummaryRow.getCell(1).value = `TỔNG CỘNG: ${usersList.length} tài khoản`;
  khSummaryRow.getCell(1).font = { bold: true, color: { argb: '1E40AF' } };

  for (let c = 1; c <= 7; c++) {
    khSummaryRow.getCell(c).border = borderStyle;
    khSummaryRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };
  }

  autofitColumns(sheetKhachHang);

  // Write workbook buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Bao_cao_tong_hop_${siteName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

async function convertSvgToPngBuffer(svgElement: any): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    try {
      const svgClone = svgElement.cloneNode(true);
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
      const width = svgElement.clientWidth || svgElement.getBoundingClientRect().width || 800;
      const height = svgElement.clientHeight || svgElement.getBoundingClientRect().height || 400;
      
      svgClone.setAttribute('width', width);
      svgClone.setAttribute('height', height);
      
      const svgString = new XMLSerializer().serializeToString(svgClone);
      
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          context.scale(scale, scale);
          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(blobURL);
            if (blob) {
              blob.arrayBuffer().then(resolve).catch(reject);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, 'image/png');
        } else {
          URL.revokeObjectURL(blobURL);
          reject(new Error('Canvas 2D Context not available'));
        }
      };
      image.onerror = (err) => {
        URL.revokeObjectURL(blobURL);
        reject(err);
      };
      image.src = blobURL;
    } catch (error) {
      reject(error);
    }
  });
}

export async function exportOrdersToExcel(orders: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách đơn hàng');
  sheet.views = [{ showGridLines: true }];

  // Title Row
  sheet.mergeCells('A1:G1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BÁO CÁO NHẬP XUẤT ĐƠN HÀNG';
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Metadata
  sheet.getCell('A3').value = 'Ngày xuất báo cáo:';
  sheet.getCell('A3').font = { bold: true };
  sheet.getCell('B3').value = new Date().toLocaleString('vi-VN');

  // Headers
  const headers = ['Mã Đơn Hàng', 'Ngày Đặt', 'Khách Hàng', 'Hình Thức TT', 'Tổng Tiền', 'Trạng Thái', 'Sản Phẩm'];
  const headerRow = sheet.getRow(5);
  headerRow.height = 24;
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3730A3' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  let currentRow = 6;
  orders.forEach((o: any) => {
    const r = sheet.getRow(currentRow);
    r.height = 20;
    r.getCell(1).value = o._id;
    r.getCell(2).value = new Date(o.createdAt).toLocaleDateString('vi-VN');
    r.getCell(3).value = o.customer?.name || 'N/A';
    r.getCell(4).value = o.paymentMethod || 'N/A';
    r.getCell(5).value = o.totalAmount || 0;
    r.getCell(6).value = o.orderStatus || 'N/A';

    const prodNames = o.products?.map((p: any) => `${p.product?.name || 'SP'} (${p.variantName || 'Default'} - x${p.quantity})`).join(', ') || '';
    r.getCell(7).value = prodNames;

    r.getCell(5).numFmt = '#,##0" ₫"';
    r.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };

    currentRow++;
  });

  applyZebraAndBorders(sheet, 5, currentRow, 7, 'EEF2F6');

  // Summary row
  const summaryRow = sheet.getRow(currentRow);
  summaryRow.height = 22;
  summaryRow.getCell(1).value = 'TỔNG CỘNG';
  summaryRow.getCell(1).font = { bold: true, color: { argb: '1E1B4B' } };
  
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  summaryRow.getCell(5).value = totalAmount;
  summaryRow.getCell(5).font = { bold: true, color: { argb: '1E1B4B' } };
  summaryRow.getCell(5).numFmt = '#,##0" ₫"';

  for (let c = 1; c <= 7; c++) {
    summaryRow.getCell(c).border = borderStyle;
    summaryRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E7FF' } };
  }

  autofitColumns(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Bao_cao_nhap_xuat_don_hang_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
