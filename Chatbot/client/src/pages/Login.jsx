import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create API URL based on state
    const url = state === "login" ? "/api/user/login" : "/api/user/register";

    try {
      const payload = state === "login"
        ? { email, password }
        : { name, email, password };

      const { data } = await axios.post(url, payload);

      if (data.success) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(state === "login" ? "Login successful!" : "Registration successful!");

        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setState("login");

        // Navigate to home page
        navigate("/login");
      } else {
        console.log("payload:", payload);
        console.log("response:", data);

        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
      >
        <p className="text-2xl font-medium m-auto text-center w-full">
          <span className="text-purple-700 dark:text-purple-400">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p className="text-sm font-medium mb-1">Full Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your full name"
              className="border border-gray-200 dark:border-gray-600 rounded w-full p-3 mt-1 outline-purple-700 dark:outline-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-sm font-medium mb-1">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="border border-gray-200 dark:border-gray-600 rounded w-full p-3 mt-1 outline-purple-700 dark:outline-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p className="text-sm font-medium mb-1">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="border border-gray-200 dark:border-gray-600 rounded w-full p-3 mt-1 outline-purple-700 dark:outline-purple-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            type="password"
            required
            minLength={6}
          />
        </div>

        <div className="w-full text-center">
          {state === "register" ? (
            <p className="text-sm">
              Already have an account?{" "}
              <span
                onClick={() => setState("login")}
                className="text-purple-700 dark:text-purple-400 cursor-pointer hover:underline font-medium"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm">
              Don't have an account?{" "}
              <span
                onClick={() => setState("register")}
                className="text-purple-700 dark:text-purple-400 cursor-pointer hover:underline font-medium"
              >
                Sign up here
              </span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 disabled:cursor-not-allowed transition-all text-white w-full py-3 rounded-md cursor-pointer font-medium text-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {state === "register" ? "Creating Account..." : "Logging in..."}
            </div>
          ) : (
            state === "register" ? "Create Account" : "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
