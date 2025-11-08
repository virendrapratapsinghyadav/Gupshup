import { create } from "zustand";
import { axiosInstance } from "../api/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  //States
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessageLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  //Functions
  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/contacts");
      set({ allContacts: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (id) => {
    set({ isMessageLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/message/${id}`);
      set({ messages: res?.data?.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const {authUser} = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`

    const optimisticMessage = {
        _id: tempId,
        senderId: authUser.id,
        receiverId: selectedUser._id,
        text: messageData.text,
        Image: messageData.image,
        createdAt: new Date().toString(),
        isOptimistic: true    //flag to identify optimistic messages
    }

    //to immediately get the message even before saved in database
     set({messages: [...messages, optimisticMessage]});

    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data.data) });
    } catch (error) {
       set({messages: messages}) //Removes optimistic message if it fails
      toast.error(error?.response?.data?.message || "Failed to send Message");
    }
  },
}));
