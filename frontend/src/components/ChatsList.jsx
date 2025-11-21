import React, { useActionState, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore';
import UserLoadingSkeleton from '../components/UserLoadingSkeleton.jsx';
import NoChatsFound from '../components/NoChatsFound.jsx';
import { useAuthStore } from '../store/useAuthStore.js';


const ChatsList = () => {

  const { chats, getMyChatPartners, isUsersLoading, setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(()=>{
    getMyChatPartners();
  },[getMyChatPartners]);

  if(isUsersLoading) return <UserLoadingSkeleton/>;
  if(chats.length === 0) return <NoChatsFound/>

  return (
     <div>
       {chats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 m-1 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() =>{ setSelectedUser(chat)}}
        >
          
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id)? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ChatsList
