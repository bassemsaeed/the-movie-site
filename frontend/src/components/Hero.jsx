import React, { useCallback, useState } from "react";
import useTheme from "../hooks/useTheme";
import TopRated from "./TopRated";
import Trending from "./Trending";

const Hero = ({ data }) => {
  const { lang, theme } = useTheme();

  return (
    <div className="w-full custom-scrollbar h-[100%] overflow-x-auto dark:border-white grid lg:grid-cols-[1fr_390px] grid-cols-1 lg:grid-rows-1 grid-rows-[1fr_300px] px-4 gap-1.5">
      <div className="dark:border-white  grid grid-rows-2 gap-1.5">
        {/** For You */}
        <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl"></div>

        {/** Trending Carousel*/}
        <Trending />
      </div>

      <TopRated />
    </div>
  );
};

export default Hero;
