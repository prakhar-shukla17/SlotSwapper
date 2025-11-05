import { create } from "zustand";
import axios from "../api/axiosInstance";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  register: async (data) => {
    try {
      set({ isLoading: true });
      const res = await axios.post("/auth/register", data);
      set({ user: res.data.data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  login: async (data) => {
    try {
      set({ isLoading: true });
      const res = await axios.post("/auth/login", data);
      set({ user: res.data.data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    await axios.post("/auth/logout");
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const res = await axios.get("/auth/me");
      set({ user: res.data.data.user });
      return { isAuthenticated: true };
    } catch {
      set({ user: null });
      return { isAuthenticated: false };
    }
  },
}));

export default useAuthStore;
