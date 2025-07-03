import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, HeartOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useFetch from "../hooks/useFetch";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";

const BASE_MEDIA_URL = "https://image.tmdb.org/t/p/w1280/";
const BASE_LOGO_URL = "https://media.themoviedb.org/t/p/w500";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Trending = () => {
  const { lang } = useTheme();
  const navigate = useNavigate();

  const [category, setCategory] = useState("movie");
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingCurrentIndexMedia, setLoadingCurrentIndexMedia] =
    useState(false);
  const [errorLoadingMedia, setErrorLoadingMedia] = useState(null);
  const [currentIndexMedia, setCurrentIndexMedia] = useState(null);
  const { data, error, loading } = useFetch(
    `${API_BASE_URL}trending?k=${category}`,
    {
      lang,
      retryCount,
    }
  );

  const MAX_ITEMS = data?.results.length || 0;

  const [isLiked, setIsLiked] = useState(false);
  const [mediaKeywords, setMediaKeywords] = useState(null);

  const idOfMovieOrSeries = data?.results[currentTrendingIndex]?.id;

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedMedia") || "[]")?.find(
      (item) => item.id === data?.results[currentTrendingIndex].id
    );

    setIsLiked(liked ? true : false);
  }, [data, currentTrendingIndex]);

  useEffect(() => {
    if (!data?.results[currentTrendingIndex].id) return;

    (async () => {
      try {
        const result = await axios.get(
          `${API_BASE_URL}${category === "movie" ? "movie" : "tv"}/${data?.results[currentTrendingIndex].id}/keywords`
        );

        if (category === "movie") setMediaKeywords(result.data.keywords);
        else setMediaKeywords(result.data.results);
      } catch (e) {
        setMediaKeywords({ error: true, val: e });
      }
    })();
  }, [currentTrendingIndex, category, data]);

  const handleNext = () => {
    if (currentTrendingIndex === MAX_ITEMS - 1) {
      setCurrentTrendingIndex(0);
      setErrorLoadingMedia(null);
    } else {
      setCurrentTrendingIndex(currentTrendingIndex + 1);
      setErrorLoadingMedia(null);
    }
  };
  const handlePrev = () => {
    if (currentTrendingIndex === 0) {
      setCurrentTrendingIndex(MAX_ITEMS - 1);
      setErrorLoadingMedia(null);
    } else {
      setCurrentTrendingIndex(currentTrendingIndex - 1);
      setErrorLoadingMedia(null);
    }
  };

  useEffect(() => {
    let controller = null;
    if (loading) {
      return;
    } else if (error) {
      setErrorLoadingMedia({
        message: "an error happend with the first use fetch",
      });
      return;
    } else if (
      (category === "tv" && data?.results[0]?.media_type === "movie") ||
      (category === "movie" && data?.results[0]?.media_type === "tv") // this is to make sure im working on the correct type of data
    ) {
      return;
    } else {
      controller = new AbortController();
      const signal = controller.signal;
      fetchMedia(signal);
    }

    async function fetchMedia(signal) {
      setLoadingCurrentIndexMedia(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}media/${category}/${data?.results[currentTrendingIndex]?.id}`,
          {
            signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setCurrentIndexMedia(result);
        setErrorLoadingMedia(null);
      } catch (error) {
        setErrorLoadingMedia(error);
      } finally {
        setLoadingCurrentIndexMedia(false);
      }
    }

    return () => {
      if (controller) {
        controller.abort();
      }
    };
  }, [category, data, loading, error, currentTrendingIndex]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-xl"></div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 grid place-content-center rounded-xl dark:text-white font-ar">
        {getTextByLang(lang, "لقد حدث خطأ", "An unexpected Error has happend")}
      </div>
    );
  }
  return (
    <motion.div className="w-full h-full bg-gray-100 dark:bg-neutral-800 rounded-xl relative">
      {
        <div
          className={
            "w-full h-full rounded-xl select-none " +
            (lang === "ar"
              ? " mask-radial-from-100% mask-radial-at-top-left mask-radial-farthest-corner"
              : " mask-radial-from-100% mask-radial-at-bottom-right mask-radial-farthest-corner")
          }
        >
          {/** MEDIA COVER MASK */}
          <img
            className="w-full h-full object-cover"
            src={
              BASE_MEDIA_URL + data.results[currentTrendingIndex].backdrop_path
            }
            alt=""
          />

          {/** INFO OF MOVIE mask */}
          <div
            className={
              " absolute top-0 w-full h-full bg-black/90 " +
              getTextByLang(
                lang,
                " mask-l-from-4 mask-t-from-105",
                " mask-r-from-4 mask-t-from-105"
              )
            }
          ></div>

          {/** MEDIA INFO CONTAINER */}
          <div className="w-full h-full absolute top-0 before:content-[''] before:absolute before:h-60 before:bottom-0  before:bg-linear-to-t before:from-black before:to-black/0 before:w-full">
            <ArrowRight
              color="white"
              className="absolute top-10/12 right-6 cursor-pointer z-50"
              onClick={lang === "ar" ? handlePrev : handleNext}
            />
            <ArrowLeft
              color="white"
              className="absolute left-10 top-10/12 cursor-pointer z-50"
              onClick={lang === "ar" ? handleNext : handlePrev}
            />

            {/** MEDIA INFO */}
            <div className="w-[600px] h-[70%] bg-transparent flex px-5  flex-col items-start  justify-end gap-2 lg:mt-1 md:mt-1 mt-6">
              {loadingCurrentIndexMedia ? (
                <div className="w-6 h-6 rounded-full animate-spin border-t-2 border-t-red-500 " />
              ) : errorLoadingMedia ? (
                <div className="text-white">
                  {data?.results[currentTrendingIndex]?.title ||
                    data?.results[currentTrendingIndex]?.name ||
                    getTextByLang(lang, "لا يوجد عنوان", "No Title")}
                </div>
              ) : currentIndexMedia?.logos?.length > 0 ? (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex justify-center items-center w-fit  h-fit"
                >
                  {currentIndexMedia.logos.filter(
                    (logo) => logo["iso_639_1"] === "en"
                  ).length === 0 ? (
                    <h2 className="text-white font-ar lg:text-2xl md:text-lg sm:text-sm text-[13px]">
                      {data?.results[currentTrendingIndex]?.title ||
                        data?.results[currentTrendingIndex]?.name}
                    </h2>
                  ) : (
                    <img
                      src={
                        BASE_LOGO_URL +
                        currentIndexMedia.logos.filter(
                          (logo) => logo["iso_639_1"] === "en"
                        )[0]?.file_path
                      }
                      className={
                        "w-full select-none sm:h-[35px] md:h-[45px] lg:h-[45px] object-cover" +
                        (Number(
                          currentIndexMedia.logos.filter(
                            (logo) => logo["iso_639_1"] === "en"
                          )[0]?.height
                        ) > 300
                          ? " h-[35px]"
                          : " h-[15px]")
                      }
                      alt="logo"
                    />
                  )}
                </motion.div>
              ) : data?.results.length > 0 ? (
                <div className="text-white">
                  {data.results[currentTrendingIndex].title}
                </div>
              ) : (
                <div>NO TITLE</div>
              )}

              <div className="h-fit z-40 ">
                <p className="font-ar lg:text-sm md:text-sm sm:text-[13px] text-[12px] w-[300px] line-clamp-2 text-white">
                  {data.results[currentTrendingIndex].overview}
                </p>
              </div>

              <div className="w-fit h-10  z-40  flex items-center justify-around gap-3">
                <button
                  className="lg:w-[130px] md:w-[130px] sm:w-[110px] w-[80px] h-10/12 rounded-lg cursor-pointer text-white font-ar border-[0.1px] border-white/10 text-sm bg-black/80"
                  onClick={() =>
                    navigate(
                      `/${category === "movie" ? "movies" : "series"}/${idOfMovieOrSeries}${lang === "ar" ? "?l=ar" : ""}`
                    )
                  }
                >
                  {getTextByLang(lang, "فتح", "Open")}
                </button>
                <button
                  className="px-3 cursor-pointer rounded-lg bg-rose-600/45 max-w-fit hover:bg-rose-600/80 h-10/12 transition-all duration-150 text-white font-ar text-sm"
                  onClick={() => {
                    const storedLikedMedia = JSON.parse(
                      localStorage.getItem("likedMedia") || "[]"
                    );

                    const currentMediaItem =
                      data?.results[currentTrendingIndex];

                    if (!isLiked) {
                      currentMediaItem.mediaKeywords =
                        mediaKeywords && mediaKeywords.length > 6
                          ? mediaKeywords?.slice(0, 11)
                          : mediaKeywords;

                      storedLikedMedia.push(currentMediaItem);
                      localStorage.setItem(
                        "likedMedia",
                        JSON.stringify(storedLikedMedia)
                      );

                      setIsLiked(true);
                    } else {
                      const newFilteredMedia = storedLikedMedia.filter(
                        (media) => media.id !== currentMediaItem.id
                      );

                      localStorage.setItem(
                        "likedMedia",
                        JSON.stringify(newFilteredMedia)
                      );

                      setIsLiked(false);
                    }
                  }}
                >
                  {isLiked ? (
                    <div className="flex max-w-fit flex-row items-center justify-center gap-2">
                      <HeartOff size={18} />{" "}
                      {getTextByLang(lang, "لم يعجبني", "Un Like")}
                    </div>
                  ) : (
                    <div className="flex flex-row items-center justify-center gap-2">
                      <Heart size={18} />{" "}
                      {getTextByLang(lang, "أعجبني", "Like")}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/** CAROUSEL INDICATOR */}
            <div className="absolute top-[90%] right-[0.75%] w-[98%] h-7 flex items-center justify-center gap-2 px-2">
              {Array.from({ length: MAX_ITEMS }).map((_, index) => (
                <div
                  key={index}
                  className={
                    "grow h-[3px]  rounded-2xl cursor-pointer " +
                    (currentTrendingIndex === index
                      ? "bg-rose-600"
                      : "bg-white")
                  }
                  onClick={() => {
                    if (currentTrendingIndex === index) {
                      setRetryCount((prev) => prev + 1);
                      return;
                    }
                    setCurrentTrendingIndex(index);
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/** TOGGLE MEIDA CONTAINER */}
          <div
            className={
              "absolute top-3  w-[96%] h-[48px] px-2 py-1 rounded-lg flex justify-around items-center gap-2  " +
              getTextByLang(
                lang,
                "lg:left-5 md:left-5 sm:left-3 left-2",
                "lg:right-5 md:right-5 sm:right-3 right-2"
              )
            }
          >
            <h2 className="font-ar text-lg font-bold text-white grow mx-1.5">
              {getTextByLang(lang, "الرائج", "Trending")}
            </h2>
            <div className="flex items-center justify-between h-full gap-3 rounded-4xl bg-black/80 w-[180px]  ">
              <button
                className={
                  "grow font-ar lg:text-sm md:text-sm sm:text-[13px] h-full rounded-4xl text-[12px] py-1.5 px-3  cursor-pointer text-white  " +
                  (category === "movie" ? "bg-white/40" : "bg-none")
                }
                onClick={() => {
                  if (category === "movie") {
                    setRetryCount((prev) => prev + 1);
                  } else {
                    setCategory("movie");
                    setCurrentIndexMedia(null);
                    setErrorLoadingMedia(null);
                  }
                }}
              >
                {getTextByLang(lang, "أفلام", "Movies")}
              </button>
              <button
                className={
                  "grow font-ar p-1 rounded-4xl h-full cursor-pointer lg:text-sm md:text-sm sm:text-[13px] text-[12px] py-1.5 text-white bg-none " +
                  (category === "tv" ? "bg-white/40" : "bg-none")
                }
                onClick={() => {
                  if (category === "tv") {
                    setRetryCount((prev) => prev + 1);
                  } else {
                    setCategory("tv");
                    setCurrentIndexMedia(null);

                    setErrorLoadingMedia(null);
                  }
                }}
              >
                {getTextByLang(lang, "مسلسلات", "Series")}
              </button>
            </div>
          </div>
        </div>
      }
    </motion.div>
  );
};

export default Trending;
