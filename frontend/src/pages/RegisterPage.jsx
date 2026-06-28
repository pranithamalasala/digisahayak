import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", village: "", language: "en" });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const result = await register(form);
    if (result.success) {
      toast.success("Welcome to DigiSahayak! 🎉");
      navigate("/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">{label}</label>
      <input className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
        type={type} placeholder={placeholder} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={["name","email","password"].includes(key)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-2">🌱</div>
          <h1 className="text-xl font-extrabold text-white">Join DigiSahayak</h1>
          <p className="text-white/70 text-xs mt-1">Free digital literacy platform for all</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Create Account</h2>
          <form onSubmit={handle} className="space-y-3">
            {field("name", "Full Name *", "text", "Your full name")}
            {field("email", "Email Address *", "email", "you@example.com")}
            {field("password", "Password *", "password", "Min. 6 characters")}
            {field("phone", "Mobile Number", "tel", "10-digit mobile number")}
            {field("village", "Village / Town", "text", "Where are you from?")}
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Preferred Language</label>
              <select className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="en">English</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="hi">Hindi (हिंदी)</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
              {loading ? "Creating account…" : "Register Free →"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
