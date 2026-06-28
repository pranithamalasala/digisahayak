import { create } from "zustand";
import { authAPI } from "../utils/api";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  initialized: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || "Login failed" };
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register(formData);
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.error || "Registration failed" };
    }
  },

  fetchMe: async () => {
    if (!localStorage.getItem("token")) {
      set({ initialized: true });
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      set({ user: data, initialized: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, initialized: true });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  updateUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
