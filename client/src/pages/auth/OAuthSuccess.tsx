import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/AuthContext";

interface JwtPayload {
  id: string;
  name: string;
  role: string;
}

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      const decoded = jwtDecode<JwtPayload>(token);

      login(
        {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
        },
        token,
      );

      switch (decoded.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "seller":
          navigate("/seller/orders");
          break;
        case "shipper":
          navigate("/shipper/deliveries");
          break;
        case "warehouse":
          navigate("/warehouse/dashboard");
          break;
        default:
          navigate("/");
          break;
      }
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging in...</div>;
}
