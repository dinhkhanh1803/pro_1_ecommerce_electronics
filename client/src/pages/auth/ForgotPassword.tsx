import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-xl">
        <h1 className="mb-2 text-2xl font-bold">Forgot Password</h1>
        <p className="mb-6 text-gray-600">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white bg-indigo-500 rounded-xl"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
        </form>

        <p className="mt-6 text-sm text-center">
          <Link to="/login" className="text-indigo-600">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
