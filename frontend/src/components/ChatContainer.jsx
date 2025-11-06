import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore.js';
import { useChatStore } from '../store/useChatStore';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import NoChatHistoryPlaceholder from './NoChatHistoryPlaceholder.jsx';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton.jsx';

const ChatContainer = () => {

  const{ messages, selectedUser, getMessagesByUserId, isMessageLoading } = useChatStore();
  const { authUser } = useAuthStore();

  useEffect(()=>{
    getMessagesByUserId(selectedUser._id)
  },[selectedUser, getMessagesByUserId])

  return (
    <div>
      <ChatHeader/>

      
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessageLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
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
              </div>
            ))}
            {/* 👇 scroll target */}
            {/* <div ref={messageEndRef} /> */}
          </div>
        ) : isMessageLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput/>
    </div>
  )
}

export default ChatContainer
