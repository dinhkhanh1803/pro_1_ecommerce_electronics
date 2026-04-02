import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return setError(data.message);
    }

    setMessage("Password reset successful. Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <h1 className="mb-4 text-2xl font-bold">Reset Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            type="password"
            placeholder="Confirm password"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-indigo-500 rounded-xl"
          >
            Reset Password
          </button>

          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
        </form>
      </div>
    </div>
  );
}
