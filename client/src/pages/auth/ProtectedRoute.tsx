import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth"; // giả sử bạn có hook auth
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute() {
  //   const { user } = useAuth(); // hoặc localStorage.getItem("token")
  // const token = localStorage.getItem("token");
  // const { user } = useAuth();
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; //
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // const user = JSON.parse(localStorage.getItem("user") || "{}");

  // if (allowedRoles && !allowedRoles.includes(user.role)) {
  //   return <Navigate to="/" replace />;
  // }

  return <Outlet />;
}
