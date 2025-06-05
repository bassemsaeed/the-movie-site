import React from "react";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";

export const ForYou = () => {
  const { lang } = useTheme();
  return (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
      <h2 className="font-ar dark:text-white">
        {getTextByLang(lang, "مخصصة لك", "For You")}
      </h2>
    </div>
  );
};
