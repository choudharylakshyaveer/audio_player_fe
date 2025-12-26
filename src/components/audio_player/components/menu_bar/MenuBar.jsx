import React, { useState, useEffect } from "react";
import { Moon, Sun, Settings, LogOut, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "../../../auth/AuthModal";
import API_BASE_URL from "../../../../config";

import SearchDropdown from "./search/SearchDropdown";

export default function MenuBar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileIcon, setProfileIcon] = useState(null);

  // SEARCH STATE
  const [query, setQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);

  // THEME STATE — single clean initialization
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme on load
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // On page load → fetch auth + profile icon
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);

    if (!token) return;

    fetch(`${API_BASE_URL.RESOURCE}/profile-icon`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProfileIcon(data.iconUrl))
      .catch(() => setProfileIcon(null));
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* TOP FIXED MENU BAR */}
      <motion.div
        initial={{ y: -22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140 }}
        className="flex items-center justify-between px-6 py-3 
                   bg-white dark:bg-slate-900 
                   text-slate-900 dark:text-white 
                   shadow-md relative z-[100]"
      >
        {/* LEFT — Theme Toggle */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-800" />
          )}
        </motion.button>

        {/* CENTER — SEARCH BAR */}
        <motion.div className="flex-1 flex justify-center relative">
          <motion.input
            type="text"
            placeholder="Search..."
            value={query}
            onFocus={() => setSearchActive(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchActive(true);
              setShowFullResults(false);
            }}
            className="px-4 py-2 rounded-full border border-gray-300 
                       text-slate-800 dark:text-white 
                       dark:bg-slate-700 dark:border-gray-600
                       focus:ring-2 focus:ring-yellow-400 
                       outline-none shadow-sm 
                       w-full max-w-lg"
            initial={{ width: 180 }}
            animate={{ width: 260 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          />
        </motion.div>

        {/* RIGHT — Login / Profile */}
        <div>
          {!isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowAuthModal(true)}
              className="p-2 rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
            >
              <LogIn className="w-5 h-5" />
            </motion.button>
          ) : (
            <div className="relative">
              <motion.img
                whileTap={{ scale: 0.85 }}
                src={
                  profileIcon ||
                  "https://cdn-icons-png.flaticon.com/512/6681/6681204.png"
                }
                className="w-10 h-10 rounded-full cursor-pointer 
                           border-2 border-yellow-400"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {/* Profile Dropdown */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute right-0 mt-2 w-48 
                               bg-white dark:bg-slate-800 
                               dark:text-white 
                               rounded-lg shadow-lg py-2 z-[200]"
                  >
                    <button className="flex items-center w-full px-4 py-2 hover:bg-gray-200 dark:hover:bg-slate-700">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 
                                 hover:bg-gray-200 dark:hover:bg-slate-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* SEARCH DROPDOWN */}
      <SearchDropdown
        query={query}
        visible={searchActive && !showFullResults}
        onClose={() => setSearchActive(false)}
        onShowFull={() => {
          setShowFullResults(true);
          setSearchActive(false);
        }}
      />

      

      {/* AUTH MODAL */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowAuthModal(false);
          }}
        />
      )}
    </>
  );
}
