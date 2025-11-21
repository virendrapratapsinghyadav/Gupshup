import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import {
  LoaderIcon,
  LogOutIcon,
  VolumeOffIcon,
  Volume2Icon,
  Bell,
} from "lucide-react";

const ProfileHeader = () => {
  const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

  const { authUser, logout, isUploading, updateProfile } = useAuthStore();
  const {
    isSoundEnabled,
    toggleSound,
    notification,
    removeNotification,
    clearNotification,
  } = useChatStore();

  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  //We have to convert it to BASE
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file); //convert image->Base64

    reader.onloadend = async () => {
      const base64String = reader.result;
      setSelectedImg(base64String);
      await updateProfile({ profilePic: base64String });
    };
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            {!isUploading ? (
              <button
                onClick={() => fileInputRef.current.click()} //This gives refrence to input which is hidden so that we hit the hidden input to function
                className="size-14 rounded-full overflow-hidden relative group"
              >
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt=""
                  className="size-full object-cover"
                />

                {/* just for the hover effect */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs">Change</span>
                </div>
              </button>
            ) : (
              <LoaderIcon className="size-10 animate-spin" />
            )}

            <input
              type="file"
              accept="image/*" //means accept only images like .png, .jpg etc.
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
              {authUser.fullName || "Loading.."}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          {/* SOUND TOGGLE BUTTONS */}
          <button
            className="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound
                .play()
                .catch((error) => console.log("Audion play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>

          {/* Notification Bell */}

          <div className="relative inline-block">
            <div className="dropdown dropdown-hover dropdown-bottom dropdown-end z-50">
              {/* Bell Button */}
              <button
                type="button"
                className={`p-2 rounded-full hover:bg-gray-300`}
              >
                <div
                  tabIndex={0}
                  role="button"
                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5 " />
                  {notification.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-[6px] py-[2px] rounded-full">
                      {notification.length}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown List */}
              <ul className="dropdown-content bg-slate-800 border border-slate-700 rounded-lg w-64 shadow-lg p-0 overflow-hidden">
                <>
                  {notification.length === 0 ? (
                    <li className="text-slate-400 text-sm px-4 py-3">
                      No notifications
                    </li>
                  ) : (
                    notification.map((item, i) => (
                      <li
                        key={i}
                        onClick={()=>removeNotification(item.id)}
                        className="px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/40 cursor-pointer"
                      >
                        {item.senderId}
                      </li>
                    ))
                  )}
                  <li
                    className="px-4 py-3 text-sm text-blue-400 hover:bg-slate-700/40 cursor-pointer text-center"
                    onClick={() => clearNotification()}
                  >
                    Mark as Read
                  </li>
                </>
              </ul>
            </div>
          </div>

          {/* LOGOUT BTN */}
          <button
            className="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
