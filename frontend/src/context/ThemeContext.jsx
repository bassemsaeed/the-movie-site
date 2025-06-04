import { createContext } from "react";

const ThemeContext = createContext({
  theme: "light",
  lang: "en",
  toggleTheme: () => {},
  setLanguage: () => {},
});

export default ThemeContext;
