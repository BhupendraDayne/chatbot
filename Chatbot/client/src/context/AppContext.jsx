import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

console.log("Server URL:", axios.defaults.baseURL);

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  // create token state
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    // fetch user data from api
    if (!token) {
      setLoadingUser(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: token },
      });
      //check the data
      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingUser(false);
    }
  };
  const createUser = async (userData) => {
    try {
      const { data } = await axios.post("/api/user/create", userData);
      if (data.success) {
        toast.success(data.message);
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return data;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // create new function for new chat
  const createNewChat = async (params) => {
    try {
      if (!user) return toast("Login to create new chat");
      navigate("/");
      await axios.get("/api/chat/create", {
        headers: { Authorization: token },
      });
      await fetchUserChat();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // const fetchUserChat = async () => {
  //   try {
  //     const { data } = await axios.get("/api/chat/get", {
  //       headers: { Authorization: token },
  //     });

  //     if (data.success) {
  //       // setChats(data.chats);
  //       // if the user has no chat  ,create a new one
  //       if (data.chats.length === 0) {
  //         await createNewChat();
  //         return fetchUserChat();
  //       }
  //        else {
  //         setSelectedChat(data.chats[0]);
  //       }
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchUser();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,
    user,
    setUser,
    fetchUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUser,
    token,
    setToken,
    createUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
