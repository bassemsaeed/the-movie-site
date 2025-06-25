import axios from "axios";
import { parse } from "date-fns";
import { motion } from "framer-motion";
import {
  BookmarkMinus,
  BookmarkPlus,
  Flame,
  HeartOff,
  Star,
} from "lucide-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import useFetch from "../hooks/useFetch";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";

const BASE_MEDIA_URL = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/";
const TopRated = React.memo(() => {
  const { lang } = useTheme();
  const [retryCount, setRetryCount] = useState(0);
  const [chosenCategory, setChosenCategory] = useState("movie");
  const [currentPage, setCurrentPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState(0);
  const [showPageNavigationModal, setShowPageNavigationModal] = useState(false);
  const MAX_PAGE = 500;
  const MIN_PAGE = 1;
  const { data, error, loading } = useFetch(
    `http://localhost:3000/top_rated?k=${chosenCategory}`,
    {
      lang,
      retryCount,
      currentPage,
    },
  );

  useLayoutEffect(() => {
    setNumOfPages(
      Number(data?.total_pages ?? 0) > MAX_PAGE
        ? 500
        : Number(data?.total_pages ?? 0),
    );
    setStartPage(1);
    setCurrentPage(1);
  }, [data?.total_pages]);

  return (
    <div className="overflow-auto relative font-ar rounded-2xl dark:text-white bg-gray-100  dark:bg-zinc-800 px-4  lg:h-full h-[calc(100vh-60px)] hidden-scrollbar">
      <div className="sticky top-0 bg-gray-100 dark:bg-zinc-800 w-full flex justify-between items-center  h-fit z-10 py-4  flex-wrap">
        <h1>{lang === "ar" ? "الأعلى تقييما" : "Top Rated"}</h1>
        <div className="flex items-center gap-3 w-fit px-3.5 py-2 dark:bg-zinc-800 bg-gray-300 rounded-lg transition-all duration-150">
          <button
            onClick={() => setChosenCategory("movie")}
            className={
              "cursor-pointer px-3 rounded-sm py-0.5 font-ar text-sm " +
              (chosenCategory === "movie" ? "bg-black/10 dark:bg-white/40" : "")
            }
          >
            {lang === "ar" ? "افلام" : "Movies"}
          </button>
          <button
            onClick={() => setChosenCategory("tv")}
            className={
              "cursor-pointer px-3 rounded-sm py-0.5 font-ar text-sm " +
              (chosenCategory === "tv" ? "bg-black/10 dark:bg-white/40" : "")
            }
          >
            {lang === "ar" ? "مسلسلات" : "Series"}
          </button>
        </div>
        <div className="w-full flex items-center gap-3 mt-1 text-[14px] -mr-1.5 border-t-[1px] pt-2">
          <TopRatedPageBtn
            page={startPage}
            currentPage={currentPage}
            loading={loading}
            error={error}
            numOfPages={numOfPages}
            retryCount={retryCount}
            setCurrentPage={setCurrentPage}
            setRetryCount={setRetryCount}
            setStartPage={setStartPage}
            startPage={startPage}
          />

          <TopRatedPageBtn
            page={startPage + 1}
            currentPage={currentPage}
            loading={loading}
            error={error}
            numOfPages={numOfPages}
            retryCount={retryCount}
            setCurrentPage={setCurrentPage}
            setRetryCount={setRetryCount}
            setStartPage={setStartPage}
            startPage={startPage}
          />

          <TopRatedPageBtn
            page={"..."}
            currentPage={currentPage}
            loading={loading}
            error={error}
            numOfPages={numOfPages}
            retryCount={retryCount}
            setCurrentPage={setCurrentPage}
            setRetryCount={setRetryCount}
            setStartPage={setStartPage}
            startPage={startPage}
            setShowPageNavigationModal={setShowPageNavigationModal}
            showPageNavigationModal={showPageNavigationModal}
          />

          <TopRatedPageBtn
            page={numOfPages - 1}
            currentPage={currentPage}
            loading={loading}
            error={error}
            numOfPages={numOfPages}
            retryCount={retryCount}
            setCurrentPage={setCurrentPage}
            setRetryCount={setRetryCount}
            setStartPage={setStartPage}
            startPage={startPage}
          />

          <TopRatedPageBtn
            page={numOfPages}
            currentPage={currentPage}
            loading={loading}
            error={error}
            numOfPages={numOfPages}
            retryCount={retryCount}
            setCurrentPage={setCurrentPage}
            setRetryCount={setRetryCount}
            setStartPage={setStartPage}
            startPage={startPage}
          />
        </div>
        {showPageNavigationModal && (
          <motion.div
            initial={{ y: -15 }}
            animate={{ y: 0 }}
            className="w-full h-10 mt-1.5 -mr-1.5"
          >
            <input
              type="text"
              className="w-full h-full px-2 outline-none"
              placeholder={
                lang === "ar"
                  ? "الذهاب الي صفحة: (يجب ان تكون رقما)"
                  : "go to page: (must be a number)"
              }
              onKeyDown={(e) => {
                const numPageToGoTo = Number(e.target.value);

                if (e.key === "Enter") {
                  if (isNaN(numPageToGoTo)) {
                    return;
                  } else if (
                    numPageToGoTo < MIN_PAGE ||
                    numPageToGoTo > numOfPages
                  ) {
                    return;
                  } else if (numPageToGoTo === MIN_PAGE) {
                    setCurrentPage(MIN_PAGE);
                    setStartPage(MIN_PAGE);
                  } else if (
                    numPageToGoTo === numOfPages ||
                    numPageToGoTo === numOfPages - 1
                  ) {
                    setCurrentPage(numPageToGoTo);
                  } else {
                    setCurrentPage(numPageToGoTo);
                    setStartPage(numPageToGoTo);
                  }
                }
              }}
            />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col py-2">
        {loading ? (
          <h2 className="font-ar">
            {lang === "ar" ? "جاري التحميل..." : "LOADING..."}
          </h2>
        ) : error ? (
          <div className="font-ar dark:text-red-400 text-red-400 h-[300px] flex justify-center items-center flex-col">
            <h4>
              {lang === "ar"
                ? "لقد حدث خطأ اثناء جلب المعلومات"
                : "An unexpected error happend"}
            </h4>
            <button
              className="text-black dark:text-white w-35 cursor-pointer border-[1px] h-12 rounded-sm"
              onClick={() => setRetryCount((prev) => prev + 1)}
            >
              {lang === "ar" ? "أعد المحاوله" : "Try Again"}
            </button>
          </div>
        ) : (
          data?.results.map((s) => (
            <MovieCard
              key={s.id}
              id={s.id}
              currentItem={s}
              bg={s.backdrop_path}
              poster={s.poster_path}
              title={s.title ? s.title : s.name}
              org_title={s.original_title ? s.original_title : s.original_name}
              rel_date={s.release_date ? s.release_date : s.first_air_date}
              rating={Number(s.vote_average).toFixed(1)}
              popularity={Number(s.popularity).toFixed(2)}
              category={chosenCategory}
            />
          ))
        )}
      </div>
    </div>
  );
});

const MovieCard = ({
  rating,
  poster,
  title,
  popularity,
  id,
  rel_date,
  category,
  org_title,
  currentItem,
}) => {
  let navigate = useNavigate();
  const { lang } = useTheme();

  const [isLiked, setIsLiked] = useState(false);
  const [isSavedInWatchLater, setIsSavedInWatchLater] = useState(false);

  const finalDate =
    lang === "ar"
      ? new Intl.DateTimeFormat("ar-EG-u-nu-arab", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(parse(rel_date, "yyyy-mm-dd", new Date()))
      : rel_date;

  useEffect(() => {
    const IS_SAVED_IN_WATCHLATER = JSON.parse(
      localStorage.getItem("watchLaterMedia") || "[]",
    ).find((item) => item?.id === id);

    const IS_IN_LIKED = JSON.parse(
      localStorage.getItem("likedMedia") || "[]",
    )?.find((item) => item?.id === id);

    if (IS_SAVED_IN_WATCHLATER) {
      setIsSavedInWatchLater(true);
    } else {
      setIsSavedInWatchLater(false);
    }

    if (IS_IN_LIKED) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [id]);

  return (
    <motion.div
      initial={{ y: -30 }}
      animate={{ y: 0 }}
      className="w-full min-h-[170px] relative"
    >
      <div className="bg-transparent w-full h-full grid grid-cols-[100px_1fr]  py-1.5">
        <div className="object-cover w-full h-full cursor-pointer">
          <img
            className="w-full h-full"
            src={BASE_MEDIA_URL + poster}
            onClick={() =>
              navigate(
                `${category === "movie" ? "movies" : "series"}/${id}${lang === "ar" ? "?l=ar" : ""}`,
              )
            }
            alt=""
          />
        </div>
        <div className="flex flex-col px-2 justify-center py-0.5">
          <div className="mb-auto flex flex-col gap-0.5">
            <h2 className="font-ardark:text-white text-ellipsis">{title}</h2>
            <p className="font-ar text-[12px] text-gray-700 dark:text-white text-ellipsis">
              {(lang === "ar" ? "العنوان الأصلي: " : "original title: ") +
                org_title}
            </p>
            <p className="font-ar text-[12px] text-gray-700 dark:text-white text-ellipsis">
              {(lang === "ar" ? "تاريخ النشر: " : "release date: ") + finalDate}
            </p>

            <div className="flex gap-4 items-center  font-ar text-sm mt-2">
              <button
                className="bg-black/15 py-1.5 px-3 rounded-sm cursor-pointer dark:bg-white/15 dark:text-white"
                onClick={() => {
                  const WATCHLATER_LIST = JSON.parse(
                    localStorage.getItem("watchLaterMedia") || "[]",
                  );

                  if (isSavedInWatchLater) {
                    const UPDATED_WATCHLATER_LIST = WATCHLATER_LIST.filter(
                      (item) => item?.id !== id,
                    );

                    localStorage.setItem(
                      "watchLaterMedia",
                      JSON.stringify(UPDATED_WATCHLATER_LIST),
                    );

                    setIsSavedInWatchLater(false);
                  } else {
                    currentItem.media_type =
                      category === "movie" ? "movie" : "tv";

                    axios
                      .get(
                        `http://localhost:3000/${category === "movie" ? "movie" : "tv"}/${id}/keywords`,
                      )
                      .then((result) => {
                        if (category === "movie") {
                          currentItem.mediaKeywords =
                            result?.data?.keywords &&
                            result?.data?.keywords.length > 11
                              ? result?.data?.keywords?.slice(0, 11)
                              : result?.data?.keywords;
                        } else {
                          currentItem.mediaKeywords =
                            result?.data?.results &&
                            result?.data?.results.length > 11
                              ? result?.data?.results?.slice(0, 11)
                              : result?.data?.results;
                        }
                        WATCHLATER_LIST.push(currentItem);

                        localStorage.setItem(
                          "watchLaterMedia",
                          JSON.stringify(WATCHLATER_LIST),
                        );
                      })
                      .catch(() => {
                        WATCHLATER_LIST.push(currentItem);

                        localStorage.setItem(
                          "watchLaterMedia",
                          JSON.stringify(WATCHLATER_LIST),
                        );
                      });

                    setIsSavedInWatchLater(true);
                  }
                }}
              >
                {isSavedInWatchLater ? (
                  <div className="flex flex-row items-center justify-center gap-2">
                    <BookmarkMinus size={18} />
                    {getTextByLang(
                      lang,
                      "إزالة من القائمة",
                      "Remove from List",
                    )}
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-center gap-2">
                    <BookmarkPlus size={18} />
                  </div>
                )}
              </button>
              <button
                className="bg-rose-500/75  hover:bg-rose-500/90 transition-all duration-100 py-1.5 px-3 rounded-sm text-white cursor-pointer flex flex-row gap-2 items-center justify-center"
                onClick={() => {
                  const storedLikedMedia = JSON.parse(
                    localStorage.getItem("likedMedia") || "[]",
                  );
                  if (isLiked) {
                    const newFilteredMedia = storedLikedMedia.filter(
                      (item) => item.id !== id,
                    );
                    localStorage.setItem(
                      "likedMedia",
                      JSON.stringify(newFilteredMedia),
                    );

                    setIsLiked(false);
                  } else {
                    currentItem.media_type =
                      category === "movie" ? "movie" : "tv";

                    axios
                      .get(
                        `http://localhost:3000/${category === "movie" ? "movie" : "tv"}/${id}/keywords`,
                      )
                      .then((result) => {
                        if (category === "movie") {
                          currentItem.mediaKeywords =
                            result?.data?.keywords &&
                            result?.data?.keywords.length > 11
                              ? result?.data?.keywords?.slice(0, 11)
                              : result?.data?.keywords;
                        } else {
                          currentItem.mediaKeywords =
                            result?.data?.results &&
                            result?.data?.results.length > 11
                              ? result?.data?.results?.slice(0, 11)
                              : result?.data?.results;
                        }

                        storedLikedMedia.push(currentItem);
                        localStorage.setItem(
                          "likedMedia",
                          JSON.stringify(storedLikedMedia),
                        );
                      })
                      .catch(() => {
                        storedLikedMedia.push(currentItem);
                        localStorage.setItem(
                          "likedMedia",
                          JSON.stringify(storedLikedMedia),
                        );
                      });

                    setIsLiked(true);
                  }
                }}
              >
                {isLiked ? (
                  <HeartOff color="white" size={20} />
                ) : (
                  getTextByLang(lang, "أعجبني", "Like")
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-ar text-[12px] text-gray-700 dark:text-white text-ellipsis flex gap-1 items-center text-center h-fit mt-1 px-2">
              <h4>
                {lang === "ar" ? "الشعبية:" : "Popularity: "} {popularity}
              </h4>
              <Flame strokeWidth={1} size={19} color="red" />
            </div>
            <div className="font-ar text-[13px] text-gray-700 dark:text-white text-ellipsis flex gap-1 items-center text-center h-fit p-2">
              <h4 className="text-center mt-1">{rating}</h4>
              <Star size={19} color="gold" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TopRatedPageBtn = ({
  page,
  currentPage,
  loading,
  error,
  numOfPages,
  setCurrentPage,
  setStartPage,
  setRetryCount,
  retryCount,
  startPage,
  setShowPageNavigationModal,
  showPageNavigationModal,
}) => {
  const MIN_PAGE = 1;

  const handlePagination = () => {
    switch (page) {
      case currentPage: {
        setRetryCount(retryCount + 1);
        break;
      }
      case numOfPages: {
        setCurrentPage(numOfPages);
        setStartPage(startPage);
        break;
      }
      case numOfPages - 1: {
        setCurrentPage(numOfPages - 1);
        setStartPage(startPage);
        break;
      }
      default: {
        if (page === MIN_PAGE) {
          setStartPage(MIN_PAGE);
          setCurrentPage(page);
        } else {
          setCurrentPage(page);
          setStartPage(page);
        }
      }
    }
  };
  const handleNavigateToSpecificPage = () => {
    setShowPageNavigationModal(!showPageNavigationModal);
  };
  const choosenHandlerBasedOnBtn =
    page == "..." ? handleNavigateToSpecificPage : handlePagination;

  if (loading) {
    return (
      <button className="px-2 py-1 bg-black/30 dark:bg-white/30 font-ar dark:text-white cursor-pointer select-none h-6.5 grow rounded-sm animate-pulse"></button>
    );
  }

  if (error) {
    return (
      <button className="px-2 py-1 bg-black/30 dark:bg-white/30 font-ar dark:text-white cursor-not-allowed select-none h-6.5 grow rounded-sm"></button>
    );
  }

  return (
    <button
      className={
        "px-2 py-1 relative font-ar dark:text-white cursor-pointer select-none h-6.5 grow rounded-sm " +
        (page === "..."
          ? "bg-black/30 dark:bg-white/30"
          : page === currentPage
            ? "bg-black/10 dark:bg-white/50"
            : "bg-black/30 dark:bg-white/30")
      }
      onClick={choosenHandlerBasedOnBtn}
    >
      {page}
    </button>
  );
};

export default TopRated;
