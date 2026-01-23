import React, { useState } from "react";
import { getTextByLang } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router";
import useTheme from "../hooks/useTheme";
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Compass,
  Clock,
  Globe
} from "lucide-react";

export const ThemeHeader = () => {
  const { lang, toggleTheme, setLanguage, theme } = useTheme();
  const [showNavSideBar, setShowNavSideBar] = useState(false);
  const location = useLocation();

  const isArabic = lang === "ar";
  const isDarkMode = theme === "dark";

  // Sidebar Variants for Animation
  const sidebarVariants = {
    closed: { x: isArabic ? "100%" : "-100%", opacity: 0 },
    open: { x: 0, opacity: 1 },
  };

  const navLinks = [
    { to: "/", label_ar: "الرئيسية", label_en: "Home", icon: <Home size={20} /> },
    { to: "/discover", label_ar: "اكتشف", label_en: "Discover", icon: <Compass size={20} /> },
    { to: "/watchlater", label_ar: "قائمتي", label_en: "My List", icon: <Clock size={20} /> },
  ];

  return (
    <>
      {/* --- HEADER BAR --- */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full h-[64px] z-50 sticky top-0 flex items-center justify-between px-4 md:px-8
                   bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-colors duration-300"
      >
        {/* LEFT: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNavSideBar(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6 text-neutral-800 dark:text-neutral-200 group-hover:text-rose-500 transition-colors" />
          </button>

          <Link to="/" className="font-ar font-black text-2xl tracking-tighter text-neutral-900 dark:text-white hover:text-rose-500 transition-colors">
            MOVI<span className="text-rose-500">X</span>
          </Link>
        </div>

        {/* RIGHT: Actions (Theme & Lang) */}
        <div className="flex items-center gap-2 md:gap-4 font-ar">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-yellow-500 dark:text-blue-400"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-gray-300 dark:bg-neutral-800" />

          {/* Language Switcher */}
          <div className="flex items-center gap-2 text-sm font-bold">
            <button
              onClick={() => setLanguage("en")}
              className={`transition-colors ${!isArabic
                  ? "text-rose-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              EN
            </button>
            <span className="text-gray-300 dark:text-gray-700">/</span>
            <button
              onClick={() => setLanguage("ar")}
              className={`transition-colors ${isArabic
                  ? "text-rose-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
            >
              AR
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- SIDEBAR DRAWER & BACKDROP --- */}
      <AnimatePresence>
        {showNavSideBar && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNavSideBar(false)}
            />

            {/* Sidebar Drawer */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 z-[70] w-72 bg-white dark:bg-neutral-900 shadow-2xl p-6 flex flex-col
                         ${isArabic ? "right-0 border-l" : "left-0 border-r"} border-gray-100 dark:border-neutral-800`}
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-neutral-800">
                <span className="font-ar font-bold text-xl dark:text-white">
                  {getTextByLang(lang, "القائمة", "Menu")}
                </span>
                <button
                  onClick={() => setShowNavSideBar(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col space-y-2 font-ar">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowNavSideBar(false)}
                      className={`flex items-center gap-4 p-3 rounded-xl transition-all font-medium
                        ${isActive
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-rose-500"
                        }`}
                    >
                      {link.icon}
                      <span>{isArabic ? link.label_ar : link.label_en}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Footer / Extra Info */}
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Globe size={16} />
                  <span>{isArabic ? "العربية" : "English"}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};