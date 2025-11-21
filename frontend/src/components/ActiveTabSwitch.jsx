import React from 'react'
import { useChatStore } from '../store/useChatStore'

const ActiveTabSwitch = () => {

  const { activeTab, setActiveTab } = useChatStore();

  const handleChats = ()=> {
    setActiveTab("chats")
  }

  const handleContacts = ()=> {
    setActiveTab("contacts")
  }


  return (
     <div className="tabs tabs-boxed bg-transparent p-2 m-2">
      <button
        onClick={handleChats}
        className={`tab ${
          activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={handleContacts}
        className={`tab ${
          activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  )
}

export default ActiveTabSwitch
