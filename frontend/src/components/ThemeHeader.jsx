import React, { useState } from "react";
import { getTextByLang } from "../utils";
import { motion } from "framer-motion";
import { Link } from "react-router";
import useTheme from "../hooks/useTheme";
import { Sun, MoonStar, Menu } from "lucide-react";

export const ThemeHeader = ({ isMedia }) => {
  const { lang, toggleTheme, setLanguage, theme } = useTheme();
  const [showNavSideBar, setShowNavSideBar] = useState(false);

  const isArabic = lang === "ar";

  const isDarkMode = theme === "dark";
  return (
    <div className="w-full h-16 z-50 bg-white dark:bg-neutral-900 sticky top-0 flex flex-row justify-between items-center  px-5">
      <div
        className={
          "w-fit h-full flex justify-center items-center gap-5 " +
          (isArabic ? " ml-2.5" : " -mr-2.5")
        }
      >
        <Menu
          onClick={() => setShowNavSideBar(!showNavSideBar)}
          color={theme === "dark" ? "white" : "black"}
          className="cursor-pointer"
        />
        {theme === "dark" ? (
          <Sun
            size={22}
            className="cursor-pointer"
            color={isDarkMode ? "white" : "black"}
            onClick={() => {
              toggleTheme();
            }}
          />
        ) : (
          <MoonStar
            size={22}
            className="cursor-pointer"
            color={isDarkMode ? "white" : "black"}
            onClick={() => {
              toggleTheme();
            }}
          />
        )}
      </div>
      <div className="w-fit text-[16px] font-bold font-ar flex">
        <button
          className={
            "cursor-pointer select-none " +
            (isArabic
              ? "text-neutral-400 dark:text-neutral-500"
              : " text-black dark:text-white ")
          }
          onClick={() => {
            isMedia
              ? (window.location.href = window.location.href.split("?")[0])
              : null;
            setLanguage("en");
          }}
        >
          {getTextByLang(lang, "انجليزية", "EG")}
        </button>
        <div className="w-[1px] h-6 bg-black dark:bg-white mx-3"></div>
        <button
          className={
            "cursor-pointer select-none " +
            (isArabic
              ? " text-black dark:text-white"
              : " text-neutral-400 dark:text-neutral-500")
          }
          onClick={() => {
            isMedia
              ? (window.location.href =
                  window.location.href.split("?")[0] + "?l=ar")
              : null;
            setLanguage("ar");
          }}
        >
          {getTextByLang(lang, "عربية", "AR")}
        </button>
      </div>

      {showNavSideBar ? (
        <motion.div
          initial={{ opacity: 0, x: lang === "ar" ? 100 : -100 }} // Slide from side based on lang
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: lang === "ar" ? 100 : -100 }}
          className="z-30 w-full sm:w-64 md:w-72 h-[calc(100vh-60px)] dark:bg-zinc-800 overflow-auto absolute bg-zinc-300 top-[60px] shadow-xl"
          style={lang === "ar" ? { right: 0 } : { left: 0 }}
        >
          <div className="w-full flex-col text-black font-ar dark:text-white divide-y divide-gray-300 dark:divide-gray-700">
            {[
              { to: "/", ar: "الرئيسية", en: "Home" },
              { to: "/discover", ar: "اكتشف", en: "Discover" },
              {
                to: "/watchlater",
                ar: "قائمة المشاهدة لاحقًا",
                en: "Watch Later",
              },
            ].map((link) => (
              <div
                key={link.to}
                className="h-fit p-3.5 px-7 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Link
                  onClick={() => {
                    setShowNavSideBar(false);
                  }}
                  to={link.to}
                  className="select-none cursor-pointer block w-full"
                >
                  {lang === "ar" ? link.ar : link.en}
                </Link>
              </div>
            ))}
            <div className="h-fit p-3.5 px-7 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
              <div
                className="select-none cursor-pointer"
                onClick={() => {
                  setShowNavSideBar(false);
                }}
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};
