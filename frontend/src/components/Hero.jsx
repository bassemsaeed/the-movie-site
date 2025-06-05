import React, { useCallback, useState } from "react";
import useTheme from "../hooks/useTheme";
import TopRated from "./TopRated";
import Trending from "./Trending";
import { ForYou } from "./ForYou";

const Hero = ({ data }) => {
  const { lang, theme } = useTheme();

  return (
    <div className="w-full custom-scrollbar h-[100%] overflow-x-hidden dark:border-white grid lg:grid-cols-[1fr_390px] grid-cols-1 lg:grid-rows-1 grid-rows-[1fr_300px] px-4 gap-1.5">
      <div className="dark:border-white  grid grid-rows-2 gap-1.5">
        {/** For You */}
        <ForYou />

        {/** Trending Carousel*/}
        <Trending />
      </div>

      <TopRated />
    </div>
  );
};

export default Hero;
