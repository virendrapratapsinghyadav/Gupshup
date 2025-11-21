import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader.jsx';
import MessageInput from './MessageInput.jsx';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder.jsx';
import MessageLoadingSkeleton from './MessageLoadingSkeleton.jsx';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Trash } from 'lucide-react';

const ChatContainer = () => {

  const { authUser } = useAuthStore();
  const { selectedUser, getMessageByUserId, isMessagesLoading, messages, subscribeToMessages, unsubscribeFromMessages, utility, setUtility, deleteMessage } = useChatStore();
  const messageEndRef = useRef(null);

  useEffect(()=>{
    console.log(selectedUser);
  },[]);

useEffect(()=>{
  if(selectedUser?._id) getMessageByUserId(selectedUser._id);
},[getMessageByUserId, selectedUser]);


useEffect(()=>{
  subscribeToMessages();

  //cleanup
  return ()=>unsubscribeFromMessages();
},[ subscribeToMessages, unsubscribeFromMessages, selectedUser])


//So that on every message it scroll autoMatically 
useEffect(()=>{
  if(messageEndRef.current){
    messageEndRef.current.scrollIntoView({ behaviour: "smooth"});
  }
})


  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6 ">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} group`}
              >

                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                
                <div 
                ref={messageEndRef}
                onClick = {()=>deleteMessage(msg._id)}
                className='invisible group-hover:visible ml-2 cursor-pointer right-0'>
                  <Trash />
                </div>
              </div>
            ))}
            
            {/* 👇 scroll target */}
            <div ref={messageEndRef}/>
            
          </div>
        ) : isMessagesLoading ? (
          <MessageLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
        
      </div>

      <MessageInput />
    </>
  )
}

export default ChatContainer
