import React, { useState } from "react";
import ApiService from "../common/ApiService";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);

  const fadeOutToast = () => setTimeout(() => setToast(null), 2500);

const handleAuth = async () => {
  try {
    if (isLogin) {
      const response = await ApiService.post(
        "/login",
        { username, password },
        { type: "AUTH" }
      );

      const token = response.token ?? response;

      sessionStorage.setItem("authToken", token);
      setToast({ type: "success", message: "🎉 Login Successful" });
      fadeOutToast();
      onLoginSuccess(token);
    } else {
      await ApiService.post(
        "/register",
        { username, password },
        { type: "AUTH" }
      );

      setToast({ type: "success", message: "🚀 Signup successful! Please login" });
      fadeOutToast();
      setIsLogin(true);
    }
  } catch (err) {
    console.error(err);
    setToast({ type: "error", message: "❌ Authentication failed" });
    fadeOutToast();
  }
};


  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">

    {/* Toast — high z-index and no animation for now */}
    {toast && (
      <div
        className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg text-white shadow-lg z-[10000]
        ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
      >
        {toast.message}
      </div>
    )}

    {/* Modal Box */}
    <div className="relative bg-white dark:bg-slate-900 dark:text-white p-6 rounded-xl shadow-xl w-96 z-[10001]">

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition text-xl font-bold z-[10002]"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">
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
          className="text-blue-500 cursor-pointer font-semibold"
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
