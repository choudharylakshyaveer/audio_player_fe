import React, { useState } from "react";
import ApiService from "../common/ApiService";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async () => {
    try {
      if (isLogin) {
        // Login via ApiService
        const token = await ApiService.post("/login", { username, password }, { rawResponse: true }, "AUTH");
        sessionStorage.setItem("authToken", token);
        onLoginSuccess(token);
      } else {
        // Signup via ApiService
        await ApiService.post("/register", { username, password }, { rawResponse: true }, "AUTH");
        alert("Signup successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      alert("Authentication failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">
          {isLogin ? "Login" : "Sign Up"}
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded dark:bg-slate-800 dark:border-gray-600"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded dark:bg-slate-800 dark:border-gray-600"
        />
        <button
          onClick={handleAuth}
          className="w-full py-2 bg-yellow-400 text-slate-900 font-semibold rounded hover:bg-yellow-300 transition"
        >
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <p className="mt-4 text-center text-sm">
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 cursor-pointer"
          >
            {isLogin ? "Sign up" : "Login"}
          </span>
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
