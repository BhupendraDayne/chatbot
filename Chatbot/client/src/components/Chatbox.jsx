import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext';
import { assets } from "../assets/assets";
import Message from './Message';
const Chatbox = () => {
  const containerRef =useRef(null)
  const {selectedChat, theme} = useAppContext();
  const [messages,setMessages] = useState([])
  const [loading,setLoading] = useState(false)
  const [prompt,setPrompt] = useState("")
  const [mode,setMode] = useState("text")
  const [ispublished,setIspublished] =useState(false)
  const onSubmit =async (e)=>{
    e.preventDefault()
  }
  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  },[selectedChat])
  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior:"smooth"
      })
    }
  },[messages])
  
  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40'>
      {/* chat messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
       {messages.length === 0 && (
        <div className='h-full flex flex-col items-center justify-center gap-2 text-primary'>
          <img src={theme === "dark" ? assets.logo_full_dark2 : assets.logo_full2} className='w-full max-w-56 sm:max-w-68 ' alt="" />
          <p className='mt-3 text-4xl sm:text-6xl text-center text-gray-500 font-medium dark:text-white '>Ask Me Anything.</p>
        </div>
       )}
       { messages.map((message,index)=><Message key={index} message={message}/> )}
       {/* loding animation */}
       {
        loading && <div className='loader flex items-center gap-1.5'>
          <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
          </div>
           <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
          </div>
           <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
          </div>
           <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
          </div>
        </div>
       }
      </div>
      {/* promte input box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 
      rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
           <select onChange={(e)=>setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
            <option className='dark:bg-purple-900' value="text">Text</option>
            <option className='dark:bg-purple-900' value="image">Image</option>
           </select>
           <input onChange={(e)=>setPrompt(e.target.value)} value={prompt} type="text" placeholder='Ask your query...'
            className='flex-1 w-full text-sm outline-none' required />
            <button disabled={loading}>
              <img src={loading ? assets.stop_icon: assets.send_icon} className='w-8 cursor-pointer' alt="" />
            </button>
      </form>
    </div>
  )
}

export default Chatbox
