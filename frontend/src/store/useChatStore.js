import { create } from 'zustand';
import { axiosInstance } from "../api/axios.js";
import toast from 'react-hot-toast';



export const useChatStore = create((set, get)=>({

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
    toggleSound: ()=>{
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled)
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab)=>set({activeTab: tab}),
    
    setSelectedUser: (selectedUser)=>set({selectedUser}),
    

    getAllContacts: async()=>{
        set({isUsersLoading: true})
        try {
            const res = await axiosInstance.get('/message/contacts')
            set({allContacts: res.data.data})
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading: false})
        }
    },

    getMyChatPartners: async()=>{
        set({isUsersLoading: true});
        try {
            const res = await axiosInstance.get('/message/chats');
            set({chats: res.data.data})
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isUsersLoading: false});
        }
    },

    getMessagesByUserId: async(id)=>{
        set({isMessageLoading: true})
        try {
            const res = await axiosInstance.get(`/message/${id}`)
            set({messages: res?.data?.data})
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            set({isMessageLoading: false})
        }
    },




}));