import React, { useState, useEffect } from "react";
import { Moon, Settings, LogOut } from "lucide-react";
import AuthModal from "../../../auth/AuthModal";
import API_BASE_URL from "../../../../config";

export default function MenuBar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileIcon, setProfileIcon] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);

    if (token) {
      fetch(`${API_BASE_URL.RESOURCE}/profile-icon`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProfileIcon(data.iconUrl))
        .catch(() => setProfileIcon(null));
    }

    // ✅ Initialize dark mode from localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold">🎵 MyApp</div>

      {/* Search Bar */}
      <div className="flex-1 text-center">
        <input
          type="text"
          placeholder="Search..."
          className="w-3/5 px-4 py-2 rounded-full border border-gray-300 text-slate-800 dark:text-white dark:bg-slate-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* Right Section */}
      <div className="relative">
        {!isLoggedIn ? (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 py-2 rounded-full bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300 transition"
          >
            Login / Signup
          </button>
        ) : (
          <div>
            <img
              src={profileIcon || "https://cdn-icons-png.flaticon.com/512/6681/6681204.png"}
              alt="profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-yellow-400"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg shadow-lg py-2 z-10">
                
                <button
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-700"
                  onClick={toggleDarkMode}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  {darkMode ? "Light Mode" : "Night Mode"}
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-700"
                  onClick={() => alert("Open Settings modal here")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-700 text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
