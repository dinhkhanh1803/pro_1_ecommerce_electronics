# 🛒 Electronics E-Commerce Website

Dự án website thương mại điện tử chuyên cung cấp các thiết bị điện tử. Hệ thống bao gồm đầy đủ các tính năng phục vụ cho cả khách hàng mua sắm và quản trị viên quản lý cửa hàng, với giao diện hiện đại và hiệu năng cao.

---

## ✨ 1. Giới thiệu chức năng

Hệ thống được chia thành hai phần chính với các chức năng tương ứng:

### 👤 Dành cho Khách hàng (Client):
* **Xác thực người dùng:** Đăng ký, đăng nhập bằng tài khoản (Email/Password) hoặc thông qua Google (Google OAuth20). Hỗ trợ khôi phục mật khẩu qua OTP/Email.
* **Mua sắm:** Xem danh sách sản phẩm, tìm kiếm, lọc và xem chi tiết thiết bị điện tử.
* **Giỏ hàng & Thanh toán:** Thêm sản phẩm vào giỏ hàng, quản lý số lượng, áp dụng mã giảm giá (Coupon) và tiến hành đặt hàng.
* **Quản lý tài khoản:** Xem lịch sử đơn hàng, theo dõi trạng thái giao hàng, quản lý danh sách yêu thích (Wishlist) và đánh giá/nhận xét (Review) sản phẩm.
* **Hỗ trợ:** Chat trực tiếp với cửa hàng.

### 🛡️ Dành cho Quản trị viên & Nhân viên (Admin/Seller/Shipper):
* **Quản lý Sản phẩm & Danh mục:** Thêm, sửa, xóa sản phẩm/danh mục. Quản lý hình ảnh trực tiếp qua Cloudinary.
* **Quản lý Đơn hàng & Vận chuyển:** Theo dõi, cập nhật trạng thái đơn hàng. Có phân hệ riêng cho Shipper (giao hàng, thu tiền COD).
* **Quản lý Tài chính & Thống kê:** Xem biểu đồ doanh thu trực quan, báo cáo tài chính (Finance/Revenue).
* **Quản lý Nội dung (CMS) & Khuyến mãi:** Quản lý banner, thiết lập hệ thống, tạo mã giảm giá.
* **Quản lý Người dùng:** Phân quyền và quản lý danh sách khách hàng, nhân viên.

---

## 🛠️ 2. Tech Stack (Công nghệ sử dụng)

### Frontend (Client)
* **Core:** React 18, TypeScript, Vite.
* **Styling:** Tailwind CSS, PostCSS, Autoprefixer.
* **Routing:** React Router DOM (v6).
* **UI/UX & Data Vis:** Lucide React (Icons), Recharts (Biểu đồ).
* **State/Auth:** `jwt-decode`, Context API (Auth, Cart, Wishlist).

### Backend (Server)
* **Core:** Node.js, Express.js (v5).
* **Cơ sở dữ liệu:** MongoDB, Mongoose.
* **Xác thực & Bảo mật:** JSON Web Token (JWT), Bcryptjs, Passport.js (Google OAuth20).
* **Lưu trữ file:** Multer, Cloudinary, Streamifier.
* **Tiện ích khác:** Nodemailer (Gửi email), Cors, Dotenv.

---

## 🚀 3. Hướng dẫn cài đặt và Setup dự án

### Yêu cầu hệ thống:
* [Node.js](https://nodejs.org/) (Khuyến nghị bản v18 hoặc v20+)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local) hoặc tài khoản MongoDB Atlas.
* Tài khoản Cloudinary (để lưu ảnh).
* Tài khoản Google Cloud Console (để lấy API đăng nhập Google).

### Bước 1: Clone dự án
Bash
git clone <đường-dẫn-repo-của-bạn>
cd pro_1_ecommerce_electronics-main

Bước 2: Cài đặt và cấu hình Backend (Server)
Mở terminal và di chuyển vào thư mục backend:
Bash
cd backend
npm install
Tạo file .env ở thư mục backend và điền các thông tin sau:

Code snippet
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/electronics_db

# Authentication
JWT_SECRET=chuoi_ky_tu_bi_mat_cua_ban_o_day

# Google OAuth (Passport)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary (Upload ảnh)
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
Khởi chạy Server:

Bash
npm run dev
(Server sẽ chạy tại http://localhost:5000)

Bước 3: Cài đặt và cấu hình Frontend (Client)
Mở một terminal mới và di chuyển vào thư mục client:

Bash
cd client
npm install
Khởi chạy Frontend:

Bash
npm run dev
(Giao diện sẽ chạy tại http://localhost:5173/)

⚠️ 4. Lỗi thường gặp và Cách xử lý
1. Lỗi: MongoError: connect ECONNREFUSED 127.0.0.1:27017

Nguyên nhân: MongoDB chưa được bật hoặc sai MONGO_URI.

Xử lý: Bật MongoDB service trên máy tính hoặc kiểm tra lại đường dẫn/IP Whitelist nếu dùng MongoDB Atlas.

2. Lỗi: EADDRINUSE: address already in use :::5000 (hoặc 5173)

Nguyên nhân: Port 5000 hoặc 5173 đã có ứng dụng khác chạy.

Xử lý: Đổi PORT trong file .env của backend (vd: PORT=5001), hoặc tắt process đang chiếm dụng port đó.

3. Lỗi: CORS Policy (Client không kết nối được Server)

Nguyên nhân: Cấu hình CORS ở Backend chưa cho phép port của Frontend.

Xử lý: Kiểm tra file backend/src/app.js, đảm bảo cors được cấu hình đúng:

JavaScript
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
4. Lỗi: Upload ảnh thất bại (Cloudinary)

Nguyên nhân: Thiếu hoặc sai CLOUDINARY_URL trong .env.

Xử lý: Đăng nhập Cloudinary Dashboard, copy lại chuỗi API Environment variable và dán vào .env.

5. Lỗi đăng nhập bằng Google (OAuth20) bị lỗi "redirect_uri_mismatch"

Nguyên nhân: URL callback trên Google Cloud Console không khớp với code Backend.

Xử lý: Vào Google Cloud Console, phần "Authorized redirect URIs" thêm chính xác đường dẫn callback của server (vd: http://localhost:5000/api/auth/google/callback).

✅ 5. Checklist Setup Dành Cho Người Mới
[ ] Đã cài Node.js, Git và thiết lập MongoDB thành công.

[ ] Chạy npm install thành công ở cả 2 thư mục backend và client.

[ ] Đã tạo file backend/.env và điền đủ thông tin (đặc biệt là MONGO_URI và JWT_SECRET).

[ ] Backend chạy npm run dev báo "Connected to MongoDB" (không lỗi đỏ).

[ ] Frontend chạy npm run dev báo thành công và truy cập được http://localhost:5173/.

[ ] Đăng ký thử 1 tài khoản mới trên giao diện web để test kết nối DB.



