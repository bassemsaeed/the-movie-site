import { useLayoutEffect, useState } from "react";
import ThemeContext from "./context/ThemeContext";

function App({ children }) {
  const [themeState, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem("appSettings");
    return storedTheme
      ? JSON.parse(storedTheme)
      : { theme: "light", lang: "en" };
  });

  useLayoutEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(themeState));
    const likedMedia = localStorage.getItem("likedMedia")
      ? JSON.parse(localStorage.getItem("likedMedia"))
      : [];

    const watchLaterMedia = localStorage.getItem("watchLaterMedia")
      ? JSON.parse(localStorage.getItem("watchLaterMedia"))
      : [];

    localStorage.setItem("likedMedia", JSON.stringify(likedMedia));
    localStorage.setItem("watchLaterMedia", JSON.stringify(watchLaterMedia));
    document.documentElement.setAttribute("lang", themeState.lang);

    document.documentElement.setAttribute(
      "dir",
      themeState.lang === "ar" ? "rtl" : "ltr",
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

export default App;
