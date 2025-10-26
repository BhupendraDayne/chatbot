 import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment"
import Credits from "../pages/Credits";

const Slidebar = ({isMenuOpen,setMenuOpen}) => {
  const { chats, setSelectedChat, theme, setTheme, user,navigate  } = useAppContext();
  const [search, setSearch] = useState("");

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-4.5 
      dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 
      border-r border-[#80699F]/30 backdrop-blur-3xl 
      transition-all duration-500 max-md:absolute left-0 z-10 ${!isMenuOpen && "max-md:-translate-x-full"}`}
    >
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full_dark2 : assets.logo_full2}
        alt="logo"
        className="w-full max-w-54"
      />

      {/* New Chat Button */}
      <button
        className="flex justify-center items-center py-2 mt-5 text-white 
        bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Box */}
      <div
        className="flex items-center gap-2 p-3 mt-3 border border-gray-400
        dark:border-white/20 rounded-md"
      >
        <img src={assets.search_icon2} className="w-4 dark:invert" alt="search" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search conversation"
          className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-3 text-sm">Recent Chats</p>}

      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          .filter((chat) => {
            const term = search.toLowerCase();
            const message = chat.messages[0]?.content ?.toLowerCase() || "";
            const name = chat.name?.toLowerCase() || "";
            return message.includes(term) || name.includes(term);
          })
          .map((chat) => (
           <div onClick={()=>{navigate("/"); setSelectedChat(chat);setMenuOpen(false)}}
  key={chat._id}
  className="p-2 px-4 flex justify-between items-center
  dark:bg-[#57317C]/10 border border-gray-300
  dark:border-[#80699F]/15 rounded-md cursor-pointer
  hover:bg-gray-100 dark:hover:bg-[#57317C]/20
  group transition-all duration-200"
>
  {/* Chat Info */}
  <div className="flex-1 min-w-0">
    <p className="truncate w-full">
      {chat.messages.length > 0
        ? chat.messages[0].content.slice(0, 32)
        : chat.name}
    </p>
    <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
      {moment(chat.updatedAt).fromNow()}
    </p>
  </div>

  {/* Delete Icon — appears on hover */}
  <img
    src={assets.bin_icon}
    alt="delete"
    onClick={(e) => {
      e.stopPropagation(); // prevents chat click event
      // deleteChat(chat._id); // optional delete function
    }}
    className="hidden group-hover:block w-4 cursor-pointer not-dark:invert"
  />
</div>

          ))}
      </div>
      {/* community image */}
     <div onClick={()=>{navigate("/community"); setMenuOpen(false)}} className="flex items-center gap-2 p-3 mt-4 border border-gray-300 
     dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
        <img src={assets.gallery_icon} className="w-4.5  " alt="" />
      <div className="flex flex-col text-sm">
        <p>Community Images</p>
      </div>
    </div>
      {/* credite purchess */}
     <div onClick={()=>{navigate("/credits")}}  className="flex items-center gap-2 p-3 mt-3 border border-gray-300 
     dark:border-white/15 rounded-md cursor-pointer hover:scale-103 transition-all">
        <img src={assets.diamond_icon} className="w-4.5 dark:invert " alt="" />
      <div className="flex flex-col text-sm">
        <p>Credite : { user?.credits}</p>
        <p className="text-xs text-gray-400">Purchase Credite to use myHealthBot</p>
      </div>
    </div>
       {/* Dark mode toggel */}
     <div  className="flex items-center justify-between gap-2 p-3 mt-3 border border-gray-300 
     dark:border-white/15 rounded-md ">
       
      <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4.5 not-dark:invert " alt="" />
        <p>Dark Mode Toggel</p>
      </div>
      <label className="relative inline-flex cursor-pointer">
        <input onClick={()=>setTheme(theme === "dark" ? "light" :"dark")} type="checkbox" className="sr-only peer" checked={theme === "dark"}/>
      <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all">
      </div>
      <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full
      transition-transform peer-checked:translate-x-4"></span>
      </label>
    </div>
       {/* user Account */}
     <div  className="flex items-center gap-3 p-3 mt-3 border border-gray-300 
     dark:border-white/15 rounded-md cursor-pointer group">
        <img src={assets.user_icon} className="w-8 rounded-full  " alt="" />
        <p className="flex-1 text-sm dark:text-primary truncate">{user ? user.name : "Login Your Account"}</p>
        {user && <img src={assets.logout_icon} className="h-5 cursor-pointer hidden not-dark:invert group-hover:block"/>}
    </div>
    {/* closed icon */}
    <img onClick={()=>setMenuOpen(false)} src={assets.close_icon} className="absolute top-3 right-3 w-3 h-5 cursor-pointer md:hidden not-dark:invert" alt="" />
     </div>
  );
};

export default Slidebar;
