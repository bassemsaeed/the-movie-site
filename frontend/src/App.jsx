import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import { MoonStar, Sun, Menu, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router";

import ThemeContext from "./context/ThemeContext";
import useTheme from "./hooks/useTheme";

function App({ children }) {
  const [themeState, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem("appSettings");
    return storedTheme
      ? JSON.parse(storedTheme)
      : { theme: "light", lang: "en" };
  });

  useLayoutEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(themeState));
    document.documentElement.setAttribute("lang", themeState.lang);

    document.documentElement.setAttribute(
      "dir",
      themeState.lang === "ar" ? "rtl" : "ltr"
    );

    if (themeState.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeState]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      return {
        ...prev,
        theme: prev.theme === "light" ? "dark" : "light",
      };
    });
  };

  const setLanguage = (newLang) => {
    setThemeState((prev) => ({
      ...prev,
      lang: newLang,
    }));
  };

  const contextValue = {
    theme: themeState.theme,
    lang: themeState.lang,
    toggleTheme,
    setLanguage,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

function Home() {
  const { lang, theme, toggleTheme, setLanguage } = useTheme();
  const [showSeachPage, setShowSeachPage] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const isFirstLoading = useRef(true);

  return (
    <div className="h-screen bg-white w-screen relative transition-all duration-150 dark:bg-neutral-900 overflow-x-hidden">
      {/** NAV BAR */}
      <motion.div
        key={lang}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-w-fit h-[60px] lg:gap-2 flex py-2 px-2 sm:px-5 md:px-6 lg:px-7 sticky top-0  z-40 justify-center items-center bg-white  dark:bg-neutral-900"
      >
        {/** MENU ICON FOR SMALLER SCREENS  */}
        <div className="flex w-fit h-full justify-center items-center ">
          <Menu
            size={24}
            className=" cursor-pointer"
            color={theme === "light" ? "black" : "white"}
            onClick={() => setShowNavMenu(!showNavMenu)}
          />
        </div>

        <div className=" hidden sm:flex lg:flex md:flex grow h-full  relative items-center  justify-center rounded-[8px]">
          <input
            type="text"
            onFocus={() => {
              setShowSeachPage(true);
            }}
            className="w-full h-full px-5 outline-none antialiased font-ar mt-1 dark:placeholder:text-gray-400 dark:text-white"
            placeholder={
              lang === "ar"
                ? "ابحث عن أي فيلم, مسلسل أو شخصية"
                : "Search any movie, tv series or characters"
            }
          />
        </div>

        {/** SEARCH ICON FOR SMALLER SCREENS INSTEAD OF FULL SEARCH BAR */}
        <div
          className="lg:hidden md:hidden sm:hidden h-full w-[50px] flex justify-center items-center "
          style={{
            marginRight: lang === "ar" ? 0 : "auto",
            marginLeft: lang === "ar" ? "auto" : 0,
          }}
        >
          <Search
            size={24}
            className="cursor-pointer"
            color={theme === "light" ? "black" : "white"}
            onClick={() => setShowSeachPage(!showSeachPage)}
          />
        </div>

        <div
          className="flex w-fit text-black text-[16px] h-full 
        gap-2 items-center  dark:text-white px-2 font-ar"
        >
          {theme === "dark" ? (
            <Sun
              size={20}
              className="cursor-pointer"
              onClick={() => {
                toggleTheme();
              }}
            />
          ) : (
            <MoonStar
              size={20}
              className="cursor-pointer"
              onClick={() => {
                toggleTheme();
              }}
            />
          )}
          <div className="flex items-center  gap-2 mt-1.5">
            <button
              className={
                (lang === "ar"
                  ? "cursor-pointer text-neutral-300"
                  : "cursor-pointer text-black dark:text-white") +
                " select-none"
              }
              onClick={() => {
                isFirstLoading.current = false;
                setLanguage("en");
              }}
            >
              {lang === "ar" ? "انجليزية" : "EG"}
            </button>
            <div className="w-[2px] h-5 bg-black dark:bg-white"></div>
            <button
              className={
                lang === "ar"
                  ? "cursor-pointer text-black dark:text-white"
                  : "cursor-pointer text-neutral-300"
              }
              onClick={() => {
                isFirstLoading.current = false;
                setLanguage("ar");
              }}
            >
              {lang === "ar" ? "عربية" : "AR"}
            </button>
          </div>
        </div>
      </motion.div>

      <Outlet />

      {showSeachPage ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="z-10 w-full h-[calc(100vh-60px)] dark:bg-zinc-800 overflow-auto absolute bg-zinc-300 top-[60px]"
        >
          <div className="w-full h-4 flex-row-reverse justify-end py-5 px-7">
            <X
              className="cursor-pointer"
              color={theme === "light" ? "black" : "white"}
              onClick={() => setShowSeachPage(false)}
            />
          </div>
        </motion.div>
      ) : null}

      {showNavMenu ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="z-10 w-full h-[calc(100vh-60px)] dark:bg-zinc-800 overflow-auto absolute bg-zinc-300 top-[60px]"
        >
          <div className="w-full flex-col text-black font-ar dark:text-white">
            <div className="h-fit border-[1px] p-3.5 px-7">
              <Link
                onClick={() => {
                  setShowSeachPage(false);
                  setShowNavMenu(false);
                }}
                to={"/"}
                className="select-none cursor-pointer"
              >
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
            </div>
            <div className="h-fit border-[1px] p-3.5 px-7">
              <Link
                to={"/discover"}
                onClick={() => {
                  setShowSeachPage(false);
                  setShowNavMenu(false);
                }}
              >
                {lang === "ar" ? "اكتشف" : "Discover"}
              </Link>
            </div>

            <div className="h-fit border-[1px] p-3.5 px-7">
              <Link
                to={"/watchlater"}
                onClick={() => {
                  setShowSeachPage(false);
                  setShowNavMenu(false);
                }}
              >
                {lang === "ar" ? "قائمة المشاهده لاحقا" : "watch later"}
              </Link>
            </div>

            <div className="h-fit border-[1px] p-3.5 px-7">
              <div
                className="select-none cursor-pointer"
                onClick={() => {
                  setShowSeachPage(false);
                  setShowNavMenu(false);
                }}
              >
                {lang === "ar" ? "اغلاق" : "close"}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export { Home };
export default App;
