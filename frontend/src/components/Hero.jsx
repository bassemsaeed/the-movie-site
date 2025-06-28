import TopRated from "./TopRated";
import Trending from "./Trending";
import { ForYou } from "./ForYou";

const Hero = () => {
  return (
    <div className="h-[calc(100vh-60px)] bg-white dark:bg-neutral-900">
      <div className="w-full custom-scrollbar h-[100%] overflow-hidden dark:border-white grid lg:grid-cols-[1fr_390px] grid-cols-1 lg:grid-rows-1 grid-rows-[800px_300px] px-4 gap-1.5">
        <div className="dark:border-white  grid grid-rows-2 gap-1.5 mt-3">
          {/** For You */}
          <ForYou />

          {/** Trending Carousel*/}
          <Trending />
        </div>

        <TopRated />
      </div>
    </div>
  );
};

export default Hero;
