import { create } from "zustand";
import { axiosInstance } from "../api/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.MODE === "development" ? "http://localhost:8080" : "/";

export const useAuthStore = create((set, get) => ({
  //States
  authUser: null,
  isCheckingAuth: true,
  isSignInUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  socket: null,
  onlineUsers: [],

  //Functions
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true, // <-- important
      });
      set({ authUser: res.data.data });
      get().connectSocket();
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
      set({ authUser: res.data.data }); // optional chaining prevents crash
      get().connectSocket();
      toast.success("Account created successfully!");
    } catch (error) {
      console.error(error); // log the full error
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSignInUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.data });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Logged in Failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoggingOut: true });
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },

  updateProfile: async (data) => {
    try {
      // Send PUT request to update profile
      const res = await axiosInstance.put("/auth/update-profile", data);

      // Update the state with the new user data
      if (res?.data?.data) {
        set({ authUser: res.data.data });
        toast.success("Profile Updated");
      } else {
        toast.warning("Profile updated, but no data returned");
      }
    } catch (error) {
      // Safely handle errors
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile";
      toast.error(errorMsg);
      console.error("Update Profile Error:", error);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.connect();

    set({ socket: socket });

    //Listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
