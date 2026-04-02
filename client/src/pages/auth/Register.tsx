import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState(""); // OTP nhập bởi user
  const [step, setStep] = useState(1); // 1: nhập info, 2: nhập OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Bước 1: gửi thông tin đăng ký → nhận OTP
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setStep(2); // chuyển sang bước OTP
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      // Lưu token và user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect theo role
      switch (data.user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "seller":
          navigate("/seller/dashboard");
          break;
        case "shipper":
          navigate("/shipper/deliveries");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-xl">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopHub</span>
          </Link>
        </div>

        {/* Card */}
        <div className="p-8 bg-white shadow-lg rounded-xl">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {step === 1 ? "Create Account" : "Verify OTP"}
          </h1>
          <p className="mb-6 text-gray-600">
            {step === 1
              ? "Join ShopHub and start shopping"
              : `OTP đã được gửi đến ${formData.email}`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <MailIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Create a password"
                    className="w-full px-4 py-3 border border-gray-300 pl-11 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <LockIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 pl-11 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                  <LockIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition-colors bg-indigo-500 rounded-xl hover:bg-indigo-600"
              >
                {loading ? "Sending OTP..." : "Create Account"}
              </button>

              {error && <p className="mt-2 text-red-500">{error}</p>}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition-colors bg-indigo-500 rounded-xl hover:bg-indigo-600"
              >
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </button>

              {error && <p className="mt-2 text-red-500">{error}</p>}
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-500 bg-white">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-3 space-x-2 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>

            <button className="flex items-center justify-center px-4 py-3 space-x-2 transition-colors border border-gray-300 rounded-xl hover:bg-gray-50">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Facebook
              </span>
            </button>
          </div>

          {/* Sign in link */}
          {step === 1 && (
            <p className="mt-6 text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
