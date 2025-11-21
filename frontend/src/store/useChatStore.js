import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  //states
  allContacts: [],
  chats: [],
  messages: [],
  notification: [],
  activeTab: "chats",
  utility: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  //Actions

  clearNotification: () => {
    set({ notification: [] });
  },

  removeNotification: (id) => {
    set((state) => ({
      notification: state.notification.filter((n) => n.id !== id),
    }));
  },

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setUtility: (msg) => {
    set({ utility: msg });
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/contacts");
      set({ allContacts: res?.data?.data });
      toast.success("Contacts Fetched");
    } catch (error) {
      console.log("Contacts failed Error: ", error);
      toast.error(error?.response?.data?.message || "Contacts Failed");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res?.data?.data });
      toast.success("Chat Partners");
    } catch (error) {
      console.log("Chat Partners Error: ", error);
      toast.error(error?.response?.data?.message || "Chats Failed");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessageByUserId: async (userId) => {
    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res?.data?.data });
      toast.success("Message fetched Successfully");
    } catch (error) {
      console.log("Message fetch Error: ", error);
      toast.error(error?.response?.data?.message || "Messages Failed");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    // optimistic messages
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      Image: messageData.image,
      createdAt: new Date().toISOString(),
    };
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(
        `message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res?.data?.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error?.response?.data?.message || "Message Failed");
    }
  },

  deleteMessage: async (msgId) => {
    const { messages } = get();
    const socket = useAuthStore.getState().socket;
    // optimistic UI removal for sender only
    set({ messages: messages.filter((msg) => msg._id !== msgId) });

    try {
      socket.emit("deleteMessage", msgId);
      //Delete from DB via RESTapi
        await axiosInstance.delete(`/message/delete/${msgId}`);
      toast.success("Message deleted");
    } catch (error) {
      // Only revert if actual server failure (network or 500)
      if (error?.response?.status && error.response.status !== 404) {
        set({ messages }); // revert UI
        toast.error(error?.response?.data?.message || "Delete Failed");
      }
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("typing", () => set({ isTyping: true }));
    socket.on("stopTyping", () => set({ isTyping: false }));

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser;
      const isSoundEnabled = get().isSoundEnabled;
      const currentMessages = get().messages;
      const currentNotification = get().notification;
      console.log("Incoming:", newMessage, "Selected:", selectedUser);

      const isSameUser = newMessage.senderId === selectedUser?._id;
      const noUserSelected = !selectedUser || !selectedUser._id;

      if (isSameUser) {
        set({
          messages: [...currentMessages, newMessage],
        });
      }
      if (!isSameUser) {
        set({
          notification: [...currentNotification, newMessage],
        });
      }

      //Notification
      if (isSoundEnabled && !isSameUser) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound
          .play()
          .catch((e) => console.log("Audio play failed: ", e));
      }
    });

    socket.off("deleteMessage");
    socket.on("deleteMessage", (messageId) => {
      const { messages } = get();
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("newMessage");
  },
}));
