import { useState } from "react";
import { authAPI } from "../utils/api";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { User, Lock, Globe, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    village: user?.village || "",
    language: user?.language || "en",
    current_password: "",
    new_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains("dark"));

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, village: form.village, language: form.language };
      if (form.new_password) {
        payload.current_password = form.current_password;
        payload.new_password = form.new_password;
      }
      const { data } = await authAPI.updateProfile(payload);
      updateUser(data.user);
      toast.success("Profile updated!");
      setForm((f) => ({ ...f, current_password: "", new_password: "" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400";

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-3">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</div>
            <div className="text-sm text-gray-400 mb-3">{user?.email}</div>
            <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {user?.role}
            </span>

            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-2 text-left">
              {[
                ["📍 Village", user?.village || "—"],
                ["📱 Phone", user?.phone || "—"],
                ["🌐 Language", { en: "English", te: "Telugu", hi: "Hindi" }[user?.language] || "English"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-xs">
                  <span className="text-gray-400">{l}</span>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mt-4">
            <div className="text-sm font-bold text-gray-900 dark:text-white mb-3">Settings</div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button onClick={toggleDark}
                className={`w-11 h-6 rounded-full transition-colors relative ${dark ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="md:col-span-2">
          <form onSubmit={save} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-1">
              <User size={16} /> Personal Information
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Mobile Number</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Village / Town</label>
                <input className={inputCls} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  <Globe size={12} className="inline mr-1" />Preferred Language
                </label>
                <select className={inputCls} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
                <Lock size={16} /> Change Password <span className="text-xs font-normal text-gray-400">(optional)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Current Password</label>
                  <input type="password" className={inputCls} value={form.current_password}
                    onChange={(e) => setForm({ ...form, current_password: e.target.value })} placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">New Password</label>
                  <input type="password" className={inputCls} value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })} placeholder="Min. 6 characters" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
              <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
