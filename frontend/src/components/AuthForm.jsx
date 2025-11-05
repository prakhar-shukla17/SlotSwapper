import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function AuthForm({ type }) {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (type === "register" && !formData.name) {
      setError("Name is required for registration");
      return;
    }

    const authAction = type === "login" ? login : register;
    const result = await authAction(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Authentication failed");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        {type === "login" ? "Sign In" : "Create Account"}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 mb-3 rounded text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "register" && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {type === "register" && (
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-60"
        >
          {isLoading
            ? "Processing..."
            : type === "login"
            ? "Sign In"
            : "Sign Up"}
        </button>
      </form>

      <div className="text-center mt-4 text-sm text-gray-600">
        {type === "login" ? (
          <>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
