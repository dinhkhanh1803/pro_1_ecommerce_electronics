// import React from "react";
// import { Navigate } from "react-router-dom";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// export function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const user = localStorage.getItem("user");

//   if (!user) {
//     // Nếu chưa login, redirect về login
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// }

import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth"; // giả sử bạn có hook auth

export function ProtectedRoute() {
  //   const { user } = useAuth(); // hoặc localStorage.getItem("token")
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // Outlet cho tất cả route con
}
