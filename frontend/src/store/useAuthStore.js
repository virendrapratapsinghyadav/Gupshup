import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";

export const useAuthStore = create((set, get) => ({
  //States
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isUploading: false,
  socket: null,
  onlineUsers: [],



  //Actions
  checkAuth: async() => {;
    try {
        const res = await axiosInstance.get("/auth/check");
        set({authUser: res?.data?.data});
        get().connectSocket();
    } 
    catch (error) {
        console.log("Error in authCheck: ",error);
        set({authUser: null})
    } 
    finally {
        set({isCheckingAuth: false})
    }
  },

  signup: async (data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({authUser: res?.data?.data});
      toast.success("Account created successfully!");
      get().connectSocket();
    } 
    catch (error) {
      console.log("Error in SignUp: ", error);
      toast.error(error?.response?.data?.message || "SignUp failed");
    }
    finally {
      set({isSigningUp: true});
    }
  },

  login: async (data) => {
    set({isLoggingIn: true})
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({authUser: res?.data?.data});
      toast.success("LoggedIn successfully");
      get().connectSocket();
    } 
    catch (error) {
      console.log("LoggedIn Error: ",error);
      toast.error(error?.response?.data?.message || "Login Failed");
    } 
    finally {
      set({isLoggingIn: false})
    }
  },

  logout: async () => {
    set({isLoggingOut: true});
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({authUser: null});
      toast.success("LoggedOut successfully");
      get().disconnectSocket();
    } 
    catch (error) {
      console.log("LogOut Error: ",error);
      toast.error(error?.response?.data?.message || "LogOut Failed")
    }
    finally {
      set({isLoggingOut: false});
    }
  },

  updateProfile: async (data) => {
    set({isUploading: true});
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({authUser: res?.data?.data});
      toast.success("Profile Updated");
    } 
    catch (error) {
      console.log("Profile Update Error: ",error);
      toast.error(error?.response?.data?.message || "Update Failed");
    }
    finally {
      set({isUploading: false});
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if(!authUser || get().socket?.connected) return;
    
    const socket = io(BASE_URL, {
      withCredentials: true,
    });
    socket.connect();
    set({socket});
    
    //Listen for online users event
    socket.on("getOnlineUsers", (userIds)=> {
      set({onlineUsers: userIds});
    });
  },

  disconnectSocket: ()=>{
    if(get().socket?.connected) get().socket.disconnect();
  },
}));
