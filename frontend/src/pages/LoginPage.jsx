// LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🌱</div>
          <h1 className="text-2xl font-extrabold text-white">DigiSahayak</h1>
          <p className="text-white/70 text-sm mt-1">Digital Literacy for Community Empowerment</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Sign In</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Email Address</label>
              <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Password</label>
              <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            Demo: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">ravi@example.com</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">Password@123</code>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Register Free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
