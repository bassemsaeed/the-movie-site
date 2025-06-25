import axios from "axios";
import { ArrowLeft, ArrowRight, StarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useTheme from "../hooks/useTheme";

import { useNavigate } from "react-router";
import { getTextByLang } from "../utils";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function getNoDublicateMovAndseriesArr() {
  const LIKED_MEDIA = JSON.parse(localStorage.getItem("likedMedia") || "[]");
  const SAVED_IN_WATCH_LATER =
    JSON.parse(localStorage.getItem("watchLaterMedia")) || "[]";

  const likedMediaIds = new Set(LIKED_MEDIA.map((item) => item.id));
  const noDuplicateMediaList = LIKED_MEDIA.concat(
    SAVED_IN_WATCH_LATER.filter((wl_item) => !likedMediaIds.has(wl_item.id)),
  );

  return noDuplicateMediaList;
}

function getCommonPreferredGenres() {
  const LIKED_MEDIA = JSON.parse(localStorage.getItem("likedMedia") || "[]");
  const SAVED_IN_WATCH_LATER = JSON.parse(
    localStorage.getItem("watchLaterMedia") || "[]",
  );

  // if no user preferred/liked data return most likely genres to be liked by user (famous most preferred genres)

  if (LIKED_MEDIA.length === 0 && SAVED_IN_WATCH_LATER.length === 0) {
    const MOST_LIKELY_TO_BE_LIKED_GENRES = [
      {
        id: 28,
        name: "Action",
      },
      {
        id: 35,
        name: "Comedy",
      },
      {
        id: 18,
        name: "Drama",
      },
      {
        id: 53,
        name: "Thriller",
      },
      {
        id: 878,
        name: "Science Fiction",
      },
      {
        id: 27,
        name: "Horror",
      },
      {
        id: 80,
        name: "Crime",
      },
      {
        id: 10749,
        name: "Romance",
      },
    ];

    const MOST_LIKELY_TO_BE_LIKED_KEYWORDS = [
      {
        keyword: "superhero",
        id: 9715,
      },
      {
        keyword: "based on a true story",
        id: 352276,
      },
      {
        keyword: "revenge",
        id: 9748,
      },
      {
        keyword: "survival",
        id: 10349,
      },
      {
        keyword: "friendship",
        id: 6054,
      },
      {
        keyword: "dystopia",
        id: 4565,
      },
      {
        keyword: "time travel",
        id: 4379,
      },
      {
        keyword: "coming of age",
        id: 10683,
      },
      {
        keyword: "heist",
        id: 10051,
      },
      {
        keyword: "magic",
        id: 2343,
      },
    ];

    const tmdbWiGenresFilterInput = MOST_LIKELY_TO_BE_LIKED_GENRES.map(
      (g) => g.id,
    ).join("|");

    const tmdbWiKeywordsFilterInput = MOST_LIKELY_TO_BE_LIKED_KEYWORDS.map(
      (K) => K.id,
    ).join("|");

    return {
      with_genres: tmdbWiGenresFilterInput,
      with_keywords: tmdbWiKeywordsFilterInput,
    };
  }

  const noDuplicateMediaList = getNoDublicateMovAndseriesArr();

  const allGenresIds = noDuplicateMediaList.flatMap((item) => {
    if (item.genre_ids) {
      return item.genre_ids;
    } else {
      return item.genres.map((g_item) => g_item.id);
    }
  });

  // A MAP FOR EACH ID, STORES HOW MANY TIMES AN ID WAS PRESENT IN THE IDS LIST; BIGGER NUMBER MEANS GENERAL INTEREST IN A SPECIFIC GENRE AND THATS WHAT WOULD DETERMINE WHAT IS GOING TO BE RECOMMENDED AND HOW MUCH IS IT RECOMMENDED

  const genresIdsInfoMap = allGenresIds.reduce((acc, id) => {
    if (acc.has(`${id}`)) {
      acc.set(`${id}`, { count: acc.get(`${id}`).count + 1 });
      return acc;
    } else {
      acc.set(`${id}`, { count: 1 });
      return acc;
    }
  }, new Map());

  const sortedGenresIdsInfoArr = Array.from(genresIdsInfoMap).sort(
    (a, b) => b[1].count - a[1].count,
  );

  const TOP_THREE_GENRES = sortedGenresIdsInfoArr
    ?.slice(0, 2)
    ?.map((g) => `${g[0]}`);
  const with_genres_filter =
    sortedGenresIdsInfoArr.length > 3
      ? TOP_THREE_GENRES[0] +
        "," +
        sortedGenresIdsInfoArr
          .slice(2)
          .map((g) => g[0])
          .join("|") +
        "|" +
        TOP_THREE_GENRES[1] +
        "," +
        sortedGenresIdsInfoArr
          .slice(2)
          .map((g) => g[0])
          .join("|")
      : sortedGenresIdsInfoArr.map((g) => g[0]).join(",");

  // A MAP FOR EACH KEYWORD ID, STORES HOW MANY TIMES AN KEYWORD ID WAS PRESENT IN THE KEYWORD IDS LIST; BIGGER NUMBER MEANS GENERAL INTEREST IN A SPECIFIC KEYWORD AND THATS WHAT WOULD DETERMINE WHAT IS GOING TO BE RECOMMENDED AND HOW MUCH IS IT RECOMMENDED

  const allKeywordsIds = noDuplicateMediaList?.flatMap((item) =>
    item.mediaKeywords?.map((kword) => kword.id),
  );

  const keywordsIdsInfoMap = allKeywordsIds.reduce((kwordsIdsMap, kwordId) => {
    const newKwordIdCount = kwordsIdsMap?.get(kwordId)
      ? kwordsIdsMap.get(kwordId).count + 1
      : 1;

    kwordsIdsMap?.set(kwordId, { count: newKwordIdCount });

    return kwordsIdsMap;
  }, new Map());

  const sortedKwordsIdsArr = Array.from(keywordsIdsInfoMap).sort(
    (a, b) => b[1].count - a[1].count,
  );

  const with_keywords_filter =
    sortedKwordsIdsArr.length > 10
      ? sortedKwordsIdsArr
          .slice(0, 10)
          .map((kword) => kword[0])
          .join("|")
      : sortedKwordsIdsArr.map((kword) => kword[0]).join("|");

  return {
    with_genres: with_genres_filter,
    with_keywords: with_keywords_filter,
  };
}

const ForYouCard = ({ item }) => {
  const { lang } = useTheme();
  const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w400";
  const FALLBACK_IMAGE_URL =
    "https://via.placeholder.com/400x600/1a202c/FFFFFF?text=No+Image";

  const imageUrl = item.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
    : FALLBACK_IMAGE_URL;

  const year = item.first_air_date
    ? new Date(item.first_air_date).getFullYear()
    : "N/A";

  const navigate = useNavigate();
  return (
    <div
      className="select-none group flex-shrink-0 relative rounded-xl overflow-hidden shadow-lg transform w-[200px] h-full  grow hover:z-10 transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => navigate(`/${item.mediaType}/${item.id}`)}
    >
      <img
        src={imageUrl}
        alt={item.name || item.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {/* Gradient overlay appears on hover for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end gap-2 p-3">
        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">
          {item.name || item.title || item.original_name}
        </h3>
        <div className="flex flex-row items-center justify-between w-full">
          <h2 className="font-ar text-gray-300 text-[12px] font-bold self-end">
            {getTextByLang(
              lang,
              item.mediaType === "movies" ? "فيلم" : "مسلسل",
              item.mediaType === "movies" ? "Movie" : "TV Series",
            )}
          </h2>
          <div className="flex items-center mt-1 text-xs text-gray-300 drop-shadow-md">
            <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{item.vote_average?.toFixed(1)}</span>
            <span className="mx-1.5">|</span>
            <span>{year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForYou = () => {
  const { lang } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(1);
  const [loadingForYouData, setLoadingForYouData] = useState(true);
  const [foryouData, setForyouData] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errLoadingForYouData, setErrLoadingForYouData] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const mainContainerRef = useRef(null);
  const endElement = useRef(null);

  const fetchData = async () => {
    if (currentPage === 1) {
      setLoadingForYouData(true);
    } else {
      setIsLoadingMore(true);
    }
    setErrLoadingForYouData(null);

    const { with_genres, with_keywords } = getCommonPreferredGenres();
    const baseUrl = "http://localhost:3000";
    const moviesUrl = `/discover/movie?genres=${with_genres}&keywords=${with_keywords}&page=${currentPage}&l=${lang}`;
    const seriesUrl = `/discover/tv?genres=${with_genres}&keywords=${with_keywords}&page=${currentPage}&l=${lang}`;

    try {
      const results = await Promise.allSettled([
        axios.get(baseUrl + moviesUrl),
        axios.get(baseUrl + seriesUrl),
      ]);

      const movies = results[0];
      const series = results[1];
      const moviesFetchErr = movies.reason !== undefined;
      const seriesFetchErr = series.reason !== undefined;

      let allResults = [];
      let finalTotalPages = 0;

      if (moviesFetchErr && seriesFetchErr) {
        setErrLoadingForYouData({ m: movies.reason, s: series.reason });
      } else {
        const haveMovies =
          !moviesFetchErr && movies.value.data.results.length > 0;
        const haveSeries =
          !seriesFetchErr && series.value.data.results.length > 0;

        if (haveMovies && haveSeries) {
          finalTotalPages = Math.min(
            movies.value.data.total_pages,
            series.value.data.total_pages,
          );
          const movieResults = movies.value.data.results.map((item) => ({
            ...item,
            mediaType: "movies",
          }));
          const seriesResults = series.value.data.results.map((item) => ({
            ...item,
            mediaType: "series",
          }));
          allResults = shuffleArray(movieResults.concat(seriesResults));
        } else if (haveMovies) {
          finalTotalPages = movies.value.data.total_pages;
          allResults = movies.value.data.results.map((item) => ({
            ...item,
            mediaType: "movies",
          }));
        } else if (haveSeries) {
          finalTotalPages = series.value.data.total_pages;
          allResults = series.value.data.results.map((item) => ({
            ...item,
            mediaType: "series",
          }));
        }

        if (currentPage === 1) {
          setTotalPages(finalTotalPages);
          const allLikedAndSavedMediaIds = new Set(
            getNoDublicateMovAndseriesArr().map((item) => item.id),
          );
          const finalFilteredResults = allResults.filter(
            (item) => !allLikedAndSavedMediaIds.has(item.id),
          );

          setForyouData(finalFilteredResults);
        } else {
          const allLikedAndSavedMediaIds = new Set(
            getNoDublicateMovAndseriesArr().map((item) => item.id),
          );
          const finalFilteredResults = allResults.filter(
            (item) => !allLikedAndSavedMediaIds.has(item.id),
          );
          setForyouData((prevData) => [...prevData, ...finalFilteredResults]);
        }
      }
    } catch (error) {
      setErrLoadingForYouData(error);
    } finally {
      setLoadingForYouData(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!isLoadingMore) {
      fetchData();
    }
  }, [currentPage, lang, retryCount]);

  useEffect(() => {
    // We can only set up the observer if we have the elements AND we are not currently loading
    if (mainContainerRef.current && endElement.current && !isLoadingMore) {
      const intersectionCallback = (entries) => {
        const entry = entries[0];
        // If the element is intersecting and we haven't reached the last page
        if (entry.isIntersecting && currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      };

      const observer = new IntersectionObserver(intersectionCallback, {
        root: mainContainerRef.current,
        rootMargin: "0px", // Load a bit before the user reaches the absolute end
        threshold: 1.0,
      });

      observer.observe(endElement.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [foryouData, isLoadingMore, currentPage, totalPages]);
  return (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-3 w-full h-full overflow-hidden">
      <h2 className="font-ar dark:text-white mb-2 mt-2">
        {getTextByLang(lang, "مخصصة لك", "For You")}
      </h2>

      <div className="h-[calc(100%-3rem)] relative">
        {loadingForYouData ? (
          <div className="h-full flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        ) : errLoadingForYouData ? (
          <div className="h-full flex flex-col gap-2 justify-center items-center font-ar dark:text-white text-xl">
            <div>
              {getTextByLang(
                lang,
                "لقد حدث خطأ اثناء جلب المعلومات.",
                "An unexpected error has happened.",
              )}
            </div>
            <button
              className="px-3 py-3 w-[120px] hover:bg-white/20 transition-all duration-150 bg-white/40 font-ar text-lg cursor-pointer rounded-lg"
              onClick={() => setRetryCount(retryCount + 1)}
            >
              {getTextByLang(lang, "أعد المحالة", "Try again!")}
            </button>
          </div>
        ) : foryouData && foryouData.length > 0 ? (
          <div className="relative h-full">
            <div
              className="flex gap-3 h-full overflow-x-auto overflow-y-hidden scrollbar-hide px-2 py-2 items-center"
              ref={mainContainerRef}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {foryouData.map((item) => (
                <ForYouCard key={item.id} item={item} />
              ))}

              {/** used to indicate we reached the end of the container to load more content */}
              {isLoadingMore && (
                <div className="flex-shrink-0 w-24 h-full flex items-center justify-center">
                  <div className="loading-spinner"></div>
                </div>
              )}
              {!isLoadingMore && currentPage < totalPages && (
                <div ref={endElement} className="w-1 h-1" />
              )}
            </div>

            {/* Right Arrow Button */}
            <div
              className="absolute top-0 -right-5 z-20 h-full w-12 bg-gradient-to-l from-gray-100/60 dark:from-zinc-800 via-gray-100/80 dark:via-zinc-800/80 to-transparent flex justify-center items-center cursor-pointer"
              onClick={() => {
                if (mainContainerRef.current) {
                  mainContainerRef.current.scrollBy({
                    left:
                      mainContainerRef.current.getBoundingClientRect().width *
                      0.8,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <button className="cursor-pointer p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors">
                <ArrowRight color="white" size={20} />
              </button>
            </div>

            {/* Left Arrow Button */}
            <div
              className="absolute top-0 -left-5 z-20 h-full w-12 bg-gradient-to-r from-gray-100 dark:from-zinc-800 via-gray-100/80 dark:via-zinc-800/80 to-transparent flex justify-center items-center cursor-pointer"
              onClick={() => {
                if (mainContainerRef.current) {
                  mainContainerRef.current.scrollBy({
                    left:
                      -mainContainerRef.current.getBoundingClientRect().width *
                      0.8,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <button className="cursor-pointer p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors">
                <ArrowLeft color="white" size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-2 justify-center items-center font-ar dark:text-white text-xl">
            <div className="text-center px-4">
              {getTextByLang(
                lang,
                "لم يتم العثور على نتائج, جرب اضافة أي فيلم أو مسلسل لقائمة الاعجاب او المشاهده لاحقا!",
                "No results found, try liking and saving any movie/series!",
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
