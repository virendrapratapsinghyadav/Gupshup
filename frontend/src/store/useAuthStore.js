 import {create} from 'zustand';
 import { axiosInstance } from '../api/axios.js';
 import toast from 'react-hot-toast';
 

 export const useAuthStore = create((set)=>({
    authUser : {name: "john", id: 123, age: 25},
    isLoggedIn: false,

    login: ()=>{
        console.log("We just logged in");
        set({isLoggedIn: true});
    }
 }))