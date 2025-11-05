import { create } from "zustand";
import { axiosInstance } from "../api/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  //States
  authUser: null,
  isCheckingAuth: true,
  isSignInUp: false,
  isLoggingIn: false,
  isLoggingOut: false,

  //Functions
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true, // <-- important
      });
      set({ authUser: res.data });
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSignInUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res?.data }); // optional chaining prevents crash
      toast.success("Account created successfully!");
    } catch (error) {
      console.error(error); // log the full error
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSignInUp: false });
    }
  },

  login: async (data) => {
    set({isLoggingIn: true});
    try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res?.data });
        toast.success("Logged in successfully");
    } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message ||"Logged in Failed");
    } finally {
        set({isLoggingIn: false})
    }
  },

  logout: async () => {
    try {
      set({ isLoggingOut: true });
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },
}));
