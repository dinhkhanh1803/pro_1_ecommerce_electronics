import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
// Public Pages
import { Home } from "./pages/public/Home";
import { ProductListing } from "./pages/public/ProductListing";
import { ProductDetail } from "./pages/public/ProductDetail";
import { Cart } from "./pages/public/Cart";
import { Checkout } from "./pages/public/Checkout";
import { PaymentReturn } from "./pages/public/PaymentReturn";
import { SearchResults } from "./pages/public/SearchResults";
// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
// Customer Pages
import { Profile } from "./pages/customer/Profile";
import { OrderHistory } from "./pages/customer/OrderHistory";
import { OrderDetail } from "./pages/customer/OrderDetail";
import { Wishlist } from "./pages/customer/Wishlist";
import { Chat } from "./pages/customer/Chat";
// Seller Pages
import { SellerProducts } from "./pages/seller/SellerProducts";
import { SellerProductForm } from "./pages/seller/SellerProductForm";
import { SellerOrders } from "./pages/seller/SellerOrders";
import { SellerRevenue } from "./pages/seller/SellerRevenue";
import { SellerPromotions } from "./pages/seller/SellerPromotions";
import { SellerReviews } from "./pages/seller/SellerReviews";
// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminFinance } from "./pages/admin/AdminFinance";
import { AdminCMS } from "./pages/admin/AdminCMS";
// Shipper Pages
import { ShipperDeliveries } from "./pages/shipper/ShipperDeliveries";
import { ShipperDeliveryDetail } from "./pages/shipper/ShipperDeliveryDetail";
import { ShipperCOD } from "./pages/shipper/ShipperCOD";
import { ProtectedRoute } from "./pages/auth/ProtectedRoute";
import OAuthSuccess from "./pages/auth/OAuthSuccess";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";

export function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Public Pages (now protected) */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Customer Pages */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/chat" element={<Chat />} />

            {/* Seller Pages */}
            <Route element={<ProtectedRoute allowedRoles={["seller", "admin"]} />}>
              <Route path="/seller/dashboard" element={<SellerRevenue />} />
              <Route path="/seller/products" element={<SellerProducts />} />
              <Route path="/seller/products/new" element={<SellerProductForm />} />
              <Route
                path="/seller/products/:id/edit"
                element={<SellerProductForm />}
              />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/promotions" element={<SellerPromotions />} />
              <Route path="/seller/reviews" element={<SellerReviews />} />
              <Route path="/seller/messages" element={<Chat />} />
            </Route>

            {/* Admin Pages */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/finance" element={<AdminFinance />} />
              <Route path="/admin/cms" element={<AdminCMS />} />
            </Route>

            {/* Shipper Pages */}
            <Route element={<ProtectedRoute allowedRoles={["shipper", "admin"]} />}>
              <Route path="/shipper/deliveries" element={<ShipperDeliveries />} />
              <Route
                path="/shipper/deliveries/:id"
                element={<ShipperDeliveryDetail />}
              />
              <Route path="/shipper/cod" element={<ShipperCOD />} />
            </Route>

          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
