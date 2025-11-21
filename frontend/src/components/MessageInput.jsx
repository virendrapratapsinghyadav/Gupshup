import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import {
  BadgePlus,
  ImageIcon,
  Languages,
  Megaphone,
  SendIcon,
  ShieldCheck,
  XIcon,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [inputActionsOpen, setInputActionsOpen] = useState(false);


  const typingTimeoutRef = useRef(null);

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji); // Append emoji
  };

  const fileInputRef = useRef(null);

  const { socket } = useAuthStore();
  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();

  const emitTyping = () => {
    if(!selectedUser) return;
    socket.emit("typing", selectedUser._id);

    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(()=>{
      socket.emit("stopTyping", selectedUser._id);
    }, 1000);
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });
    setText("");
    setImagePreview(null);
    setShowPicker(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex space-x-4"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping();
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
          placeholder="Type your message..."
        />

        <button type="button" onClick={() => setShowPicker(!showPicker)}>😊</button>

        {showPicker && (
          <div style={{ position: "absolute", bottom: "60px", zIndex: 100 }}>
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <div className="relative flex items-center">
          {/* World Icon → Opens Action Menu */}
          <button
            type="button"
            onClick={() => setInputActionsOpen((prev) => !prev)}
          >
            <BadgePlus />
          </button>

          {/* Action Menu using FAB FLOWER */}
          {inputActionsOpen && (
            <div className="fab fab-flower absolute bottom-12">
              {/* Translate */}
              <button
                type="button"
                className="btn btn-circle btn-sm mb-1"
                onClick={() => {
                  translateMessages(selectedMessages);
                  setInputActionsOpen(false);
                }}
              >
                <Languages />
              </button>

              {/* Read Aloud */}
              <button
                type="button"
                className="btn btn-circle btn-sm mb-1"
                onClick={() => {
                  readMessagesAloud(selectedMessages);
                  setInputActionsOpen(false);
                }}
              >
                <Megaphone />
              </button>

              {/* Verify Message (AI check real/fake/AI-generated) */}
              <button
                type="button"
                className="btn btn-circle btn-sm"
                onClick={() => {
                  verifyMessages(selectedMessages);
                  setInputActionsOpen(false);
                }}
              >
                <ShieldCheck />
              </button>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
export default MessageInput;
