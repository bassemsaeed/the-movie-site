import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useLoaderData, useNavigate, useNavigation } from "react-router";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";
import { motion } from "framer-motion";

import { ThemeHeader } from "../components/ThemeHeader";
import {
  Clock,
  Star,
  Calendar,
  Film,
  User,
  Share2,
  Heart,
  ArrowDown,
  BadgeInfo,
  HeartOff,
  BookmarkMinus,
  BookmarkPlus,
} from "lucide-react";
import axios from "axios";
import Episode from "../components/Episode";

// --- Constants ---
const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/";

// --- Helper Functions & Components ---

const formatRuntime = (minutes, lang) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return lang === "ar" ? `${mins}دقيقه` : `${mins}m`;
  return lang === "ar" ? `${hours} ساعه ${mins} دقيقه` : `${hours}h ${mins}m`;
};

const getImageUrl = (
  path,
  size = "original",
  fallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAWlBMVEXv8fNod4f19vhkdIRcbX52g5KPmqX29/iYoq3l6OuCj5vd4eTr7fBfcIFaa33M0dbBx82SnKe7wchtfIt8iZejq7TU2N2Ik6CwuL/Gy9Gqsrqbpa/P1NmhqrNz0egRAAADBklEQVR4nO3c63KqMBRAYUiwwUvEete27/+ax1tVAqhwEtnprO+XM62Oyw2CGTFJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJe6Mb5vqL7jjsws/wgln/dddzBZZjocuxj2HaiWNg1JL/oO3GVBA9PUzvvdF80q7AgPQ/zot1DlOnThyFBIIYWvFtrMK3mFdj30aWzFFWZjr+/qE4mFXh+YwrehsDMK34bCzmIoVEad1nC6PbD8QpXMNwOdDvKi2xMUX2jm2h7/onU2WHcZo/RCld8WN3TWZR1CeKH6LK1tTGftE2UXqpmzPGXbLwnKLkzcT8X6s/UQRReqWWX9LWs9RNGF5qOysmFb74miC9XCDUzt6k8VJtXC9jsihW9Tu5Uuq/vhvlKokuGjc1bRhWZVLdw5MWq8mU6zfNL4wKILk/W0spW6dyvOZ61p4wKd7EIzcoZot+UQVVxeA62bEmUXJuPyIV8PnDsVtxXtpikKL1S7++1U6/IZzV1g8xSFFx4i9HWMdjksNZQCGxOlFyZq8jW1VmubpZV90PngUZ8ovvDYuNt//Wy/1ZPAhsQICo+rUMa4T70msP7tJorCun8vKofKhilGWlg7wfopxlnYMMHaKUZZ2DjBuinGWPgwsDLFCAufBLqJ8RU+DXQ21OgKXwgsTzG2wpcCj1O8nsJGVvjgMNE0xbgKX5zgeYqXxKgKX57geYrnDTWmwhYTvJtiRIUtA3/fbuIpbB14mWI0hR0Cz1OMpbBT4CkxiaOwY+BpQ42isNVhwk283hJc2HmC5Va5hf8xwTgK/UxQcKGvQLGF3gKlFvoLFFroMVBmoc9AkYWeDhNyC1Xh9aJLeYV+Jyiw0Os+KLHQe6C0Qv+BwgoDBMoqDBEoqtCECJRUOPz2e5gQV2jnYa7qllOYBvr5CEGFgVBIIYXPmJ/ghZueZ+hexOWd+w3q9ycuwg5R2377DsapDflbX7rTFah+TbajQSij/aT/wNNF26FUvoELAAAAAAAAAAAAAAAAAAAAAAAAAAAA4G/4B9L3P1vg3y4/AAAAAElFTkSuQmCC",
) => {
  return path ? `${BASE_IMAGE_URL}${size}${path}` : fallback;
};

const Section = ({ title, children, className = "" }) => (
  <div className={`py-8 md:py-12 ${className} hidden-scrollbar`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden-scrollbar">
      <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100 mb-6">
        {title}
      </h2>
      {children}
    </div>
  </div>
);

// --- Sub-Components for Movie Page ---

const MediaHeder = React.memo(({ media, lang, media_type }) => (
  <div className="relative pt-16">
    <div className="absolute inset-0 h-[60vh] md:h-[80vh] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getImageUrl(media.backdrop_path)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 via-neutral-50/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-48 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <aside className="md:col-span-1 -mt-12 md:-mt-32">
          <img
            src={getImageUrl(media.poster_path, "w500")}
            alt={`${media.title} Poster`}
            className="rounded-xl shadow-2xl shadow-black/40 w-full aspect-[2/3] object-cover"
          />
        </aside>
        <main className="md:col-span-2 flex flex-col justify-end">
          <div className="text-black dark:text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
              {media.title || media.name || media.original_name}
            </h1>
            {media.tagline && (
              <p className="text-lg italic text-neutral-600 dark:text-neutral-300 mt-2 mb-6">
                "{media.tagline}"
              </p>
            )}
            <div className="mt-4">
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">
                {getTextByLang(lang, "ملخص", "Overview")}
              </h3>
              <p className="leading-relaxed text-neutral-700 dark:text-neutral-200">
                {media.overview || "No overview available."}
              </p>
            </div>
            <MediaStats media={media} media_type={media_type} />
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {media.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full text-xs px-3 py-1.5 font-semibold bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
));

const MediaStats = React.memo(({ media, media_type }) => {
  const { lang } = useTheme();

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700/50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <StatPill
          icon={<Star color="gold" />}
          label="RATING"
          value={`${media.vote_average?.toFixed(1) || "N/A"} / 10`}
        />
        <StatPill
          icon={<Clock />}
          label={media_type === "movie" ? "RUNTIME" : "Seasons"}
          value={
            media_type === "movie"
              ? formatRuntime(media.runtime, lang)
              : media.number_of_seasons
          }
        />
        <StatPill
          icon={<Calendar color="orange" />}
          label="YEAR"
          value={
            media.release_date
              ? new Date(media.release_date).getFullYear()
              : media.first_air_date
                ? new Date(media.first_air_date).getFullYear()
                : "N/A"
          }
        />

        <StatPill
          icon={<BadgeInfo />}
          label={"Category"}
          value={media_type === "tv" ? "Series" : "Movie"}
        />
        <StatPill
          icon={<Film color="red" />}
          label="STATUS"
          value={media.status || "N/A"}
        />
      </div>
    </div>
  );
});

const StatPill = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex-shrink-0 text-sky-500">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="font-bold text-base text-neutral-800 dark:text-white">
        {value}
      </p>
    </div>
  </div>
);

// RE-ADDED THIS COMPONENT
const ActionButtons = ({ lang, media, media_type }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSavedInWatchLater, setIsSavedInWatchLater] = useState(false);
  console.log(media);

  useLayoutEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedMedia"))?.find(
      (item) => item?.id === media?.id,
    );

    const IS_SAVED_IN_WATCHLATER = JSON.parse(
      localStorage.getItem("watchLaterMedia"),
    ).find((item) => item?.id === media?.id);

    if (IS_SAVED_IN_WATCHLATER) {
      setIsSavedInWatchLater(true);
    } else {
      setIsSavedInWatchLater(false);
    }

    setIsLiked(liked);
  }, [media.id]);
  return (
    <div className="max-w-7xl z-50 mx-auto px-4 sm:px-6 lg:px-8 flex gap-3 lg:mt-[70px] md:mt-[110px] sm:mt-[250px] mt-[260px] mb-8">
      <button
        className="flex items-center ju stify-center gap-2 outline-none select-none py-2 px-5 rounded-lg bg-rose-500 hover:bg-rose-600 duration-150 font-semibold text-white cursor-pointer shadow-lg shadow-rose-500/20"
        onClick={() => {
          const storedLikedMedia = JSON.parse(
            localStorage.getItem("likedMedia"),
          );

          if (isLiked) {
            // STEPS TO REMOVE FROM LIKED LIST
            const newLikedList = storedLikedMedia.filter(
              (item) => item.id !== media.id,
            );

            localStorage.setItem("likedMedia", JSON.stringify(newLikedList));
            setIsLiked(false);
          } else {
            // STEPS TO ADD ITEM TO LIKE LIST
            media.media_type = media_type;
            storedLikedMedia.push(media);
            localStorage.setItem(
              "likedMedia",
              JSON.stringify(storedLikedMedia),
            );
            setIsLiked(true);
          }
        }}
      >
        {isLiked ? (
          <div className="flex flex-row items-center justify-center gap-2">
            <HeartOff size={18} /> {getTextByLang(lang, "لم يعجبني", "Un Like")}
          </div>
        ) : (
          <div className="flex flex-row items-center justify-center gap-2">
            <Heart size={18} /> {getTextByLang(lang, "أعجبني", "Like")}
          </div>
        )}
      </button>
      <button
        className="flex items-center justify-center gap-2 outline-none select-none py-2 px-5 rounded-lg bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 duration-150 font-semibold text-white cursor-pointer shadow-lg shadow-black/10"
        onClick={() => {
          const WATCHLATER_LIST = JSON.parse(
            localStorage.getItem("watchLaterMedia"),
          );

          if (isSavedInWatchLater) {
            // steps to remove the item
            const UPDATED_WATCHLATER_LIST = WATCHLATER_LIST.filter(
              (item) => item?.id !== media?.id,
            );

            localStorage.setItem(
              "watchLaterMedia",
              JSON.stringify(UPDATED_WATCHLATER_LIST),
            );

            setIsSavedInWatchLater(false);
          } else {
            // steps to add
            WATCHLATER_LIST.push(media);
            media.media_type = media_type;
            localStorage.setItem(
              "watchLaterMedia",
              JSON.stringify(WATCHLATER_LIST),
            );

            setIsSavedInWatchLater(true);
          }
        }}
      >
        {isSavedInWatchLater ? (
          <div className="flex flex-row items-center justify-center gap-2">
            <BookmarkMinus size={18} />
            {getTextByLang(lang, "إزالة من القائمة", "Remove from List")}
          </div>
        ) : (
          <div className="flex flex-row items-center justify-center gap-2">
            <BookmarkPlus size={18} />{" "}
            {getTextByLang(lang, "أضف للمشاهدة لاحقاً", "Add to Watchlist")}
          </div>
        )}
      </button>

      <button className="flex items-center justify-center gap-2 outline-none select-none py-2 px-5 rounded-lg bg-neutral-700 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 duration-150 font-semibold text-white cursor-pointer shadow-lg shadow-black/10">
        <Share2 size={18} /> {getTextByLang(lang, "مشاركة", "Share")}
      </button>
    </div>
  );
};

const MovieCard = ({ movie }) => {
  const { lang } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 flex-shrink-0 snap-start select-none">
      <div className="group flex flex-col gap-2">
        <div
          className="aspect-[2/3] w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden relative"
          onClick={() => {
            navigate(
              `/${movie.media_type === "movie" ? "movies" : "series"}/${movie.id}${lang === "ar" ? "?l=ar" : ""}`,
            );
          }}
        >
          <img
            src={getImageUrl(movie.poster_path, "w500")}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            loading="lazy"
            draggable="false"
          />
        </div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate pr-2">
          {movie.title || movie.name}
        </h3>
      </div>
    </div>
  );
};

const RecommendedCarousel = React.memo(({ movies, lang }) => {
  const scrollContainerRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  if (!movies || movies.length === 0) return null;

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    const slider = scrollContainerRef.current;
    setDragState({
      isDown: true,
      startX: e.pageX - slider.offsetLeft,
      scrollLeft: slider.scrollLeft,
    });
    slider.classList.add("grabbing");
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.classList.remove("grabbing");
    setDragState((prev) => ({ ...prev, isDown: false }));
  };

  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.classList.remove("grabbing");
    setDragState((prev) => ({ ...prev, isDown: false }));
  };

  const handleMouseMove = (e) => {
    if (!dragState.isDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const slider = scrollContainerRef.current;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - dragState.startX) * 2;
    slider.scrollLeft = dragState.scrollLeft - walk;
  };

  return (
    <Section title={getTextByLang(lang, "موصى به", "Recommended")}>
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex hidden-scrollbar space-x-4 overflow-x-auto scroll-snap-x-mandatory scroll-smooth hide-scrollbar -mx-4 px-4 cursor-grab"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </Section>
  );
});

const ReviewsSection = React.memo(({ reviews, lang }) => {
  if (!reviews || reviews.length === 0) return null;
  return (
    <Section title={getTextByLang(lang, "الآراء", "Reviews")}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </Section>
  );
});

const ReviewCard = ({ review }) => (
  <article className="flex flex-col gap-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-5 border border-transparent hover:border-sky-500 transition-colors">
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {review.author_details.avatar_path ? (
            <img
              src={getImageUrl(review.author_details.avatar_path, "w500")}
              className="w-full h-full object-cover"
              alt={`${review.author}'s avatar`}
              loading="lazy"
            />
          ) : (
            <User className="text-neutral-500" />
          )}
        </div>
        <h3 className="font-semibold text-neutral-800 dark:text-white truncate">
          {review.author}
        </h3>
      </div>
      {review.author_details.rating && (
        <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-500 dark:text-yellow-400 rounded-full px-3 py-1 text-sm font-bold flex-shrink-0">
          <Star size={16} className="text-yellow-500" />{" "}
          <span>{review.author_details.rating}/10</span>
        </div>
      )}
    </header>
    <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-5 leading-relaxed">
      {review.content}
    </p>
  </article>
);

// --- Main Movie Component ---
const Movie = () => {
  const { results, media_type } = useLoaderData();
  const { lang } = useTheme();

  const mediaDetails = results?.[0]?.value?.data || null;
  const reviewsData = results?.[1]?.value?.data || { results: [] };
  const recommendedData = results?.[2]?.value?.data || { results: [] };

  console.log(mediaDetails);
  const seasons =
    media_type === "tv" && mediaDetails?.seasons?.length > 0
      ? mediaDetails.seasons.filter((s) => s.episode_count > 0)
      : null;

  const mainElRef = useRef(null);

  const [currentChosenSeasonIndex, setCurrentChosenSeasonIndex] = useState(0);
  const currentChosenSeason = seasons
    ? seasons[currentChosenSeasonIndex]
    : null;
  const [currentSeasonIfo, setCurrentSeasonIfo] = useState(null);
  const [loadingCurrentSeasonIfo, setLoadingCurrentSeasonIfo] = useState(false);
  const [errLoadingCurrentSeasonIfo, setErrLoadingCurrentSeasonIfo] =
    useState(null);
  const [showSeasonsDropDown, setShowSeasonsDropDown] = useState(false);
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState(null);

  const [showEpisodesDropDown, setShowEpisodesDropDown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  useLayoutEffect(() => {
    // When we navigate to a new movie/tv show, reset the state.

    setCurrentChosenSeasonIndex(0);

    // reset UI state before renders
    setShowSeasonsDropDown(false);
    setShowEpisodesDropDown(false);
    setCurrentEpisodeNum(null);

    if (mainElRef.current) {
      mainElRef.current.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [mediaDetails?.id, mainElRef]);

  useEffect(() => {
    if (!currentChosenSeason || !mediaDetails?.id) {
      setCurrentSeasonIfo(null);
      return;
    }

    const controller = new AbortController();

    async function getSeasonData() {
      // Use URLSearchParams for cleaner URL construction
      const params = new URLSearchParams();
      if (lang === "ar") {
        params.append("l", "ar");
      }

      const url = `http://localhost:3000/season/${mediaDetails.id}/${currentChosenSeason.season_number}?${params.toString()}`;
      console.log("Fetching:", url);

      try {
        setLoadingCurrentSeasonIfo(true);
        setErrLoadingCurrentSeasonIfo(null); // Clear previous errors on a new request
        setCurrentSeasonIfo(null); // Clear previous data

        const { data } = await axios.get(url, {
          signal: controller.signal,
        });

        setCurrentSeasonIfo(data);
        console.log(data, "xs");
        console.log(data.episodes[0].episode_number);

        if (data.episodes.length > 0)
          setCurrentEpisodeNum(data.episodes[0].episode_number);
      } catch (error) {
        // Don't set an error state if the request was intentionally aborted
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
          return;
        }
        setErrLoadingCurrentSeasonIfo(error);
      } finally {
        setLoadingCurrentSeasonIfo(false);
      }
    }

    getSeasonData();

    // abort the request -> useful when users send too many requests which all trigers a re render
    return () => {
      controller.abort();
    };
  }, [currentChosenSeason, mediaDetails, lang]);

  if (!mediaDetails?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 gap-3">
        <p className="text-xl text-neutral-500">
          {getTextByLang(
            lang,
            `حدث خطأ اثناء تحميل المعلومات. أعد المحاولة!`,
            ` Could not load movie details.\n
          Try refreshing the page again please.`,
          )}
        </p>
        <button
          className="px-5 py-3 rounded-2xl bg-gray-200 dark:text-white dark:bg-zinc-700 font-ar hover:bg-gray-300 cursor-pointer transition-all duration-150 dark:hover:bg-zinc-950"
          onClick={() => {
            location.reload();
          }}
        >
          {getTextByLang(lang, "اعادة المحاولة", "Refresh")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-neutral-50 h-screen dark:bg-neutral-900 custom-scrollbar font-sans overflow-x-hidden relative"
      ref={mainElRef}
    >
      {isNavigating ? (
        <div dir="ltr" className="w-screen h-[3px]  fixed top-0 z-[53]">
          <div className="w-[150px] bg-rose-500 animate-slide h-full"></div>
        </div>
      ) : null}
      <ThemeHeader isMedia={true} />
      <MediaHeder media={mediaDetails} media_type={media_type} lang={lang} />

      {seasons ? (
        <div className="w-[95%] h-fit mx-auto flex flex-col gap-3">
          <h2 className="font-ar dark:text-white text-2xl">
            {getTextByLang(lang, "المواسم والحلقات", "Seasons & Episodes")}
          </h2>
          <div className="w-full h-[60px] flex flex-row gap-2">
            <div
              className="grow h-[40px] px-4 py-3 dark:bg-white/30 font-ar text-black dark:text-white bg-black/30 cursor-pointer  items-center justify-between flex rounded-lg relative"
              onClick={(e) => {
                if (e.target.classList.contains("dp")) {
                  return;
                } else {
                  setShowSeasonsDropDown(!showSeasonsDropDown);
                }
              }}
            >
              <h3>{currentChosenSeason?.name}</h3>
              {showSeasonsDropDown ? (
                <ArrowDown className="transition-all duration-150 ease-in-out rotate-180" />
              ) : (
                <ArrowDown className="transition-all duration-150 ease-in-out" />
              )}

              {/** DROP DOWN OF ALL SEASONS */}
              {showSeasonsDropDown ? (
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={
                    "absolute py-2 bg-gray-200 dark:bg-neutral-800 top-[110%] w-full  h-fit max-h-[250px] overflow-auto custom-scrollbar flex flex-col z-[56] " +
                    " right-0"
                  }
                >
                  {seasons.map((season, i) => (
                    <div
                      key={season.id}
                      className={
                        " w-full select-none dp hover:bg-gray-300 dark:hover:bg-zinc-600 px-4 py-3 " +
                        (currentChosenSeasonIndex === i
                          ? " bg-gray-300 dark:bg-zinc-600"
                          : "")
                      }
                      onClick={() => {
                        setCurrentChosenSeasonIndex(i);
                      }}
                    >
                      {season.name}
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </div>
            <div
              className="grow h-[40px] px-4 py-3 dark:bg-white/30 font-ar text-black dark:text-white bg-black/30 items-center justify-between flex rounded-lg select-none relative"
              onClick={(e) => {
                if (e.target.classList.contains("edp")) {
                  console.log("edp");
                } else {
                  setShowEpisodesDropDown(!showEpisodesDropDown);
                }
              }}
            >
              {loadingCurrentSeasonIfo ? (
                <div className="w-5 h-5 rounded-full border-2 dark:border-white border-t-rose-500 dark:border-t-rose-500 animate-spin"></div>
              ) : currentSeasonIfo?.episodes &&
                currentSeasonIfo?.episodes.length > 0 ? (
                <h2>{currentSeasonIfo?.episodes[0].name}</h2>
              ) : null}
              {showEpisodesDropDown ? (
                <ArrowDown className="transition-all duration-150 ease-in-out rotate-180" />
              ) : (
                <ArrowDown className="transition-all duration-150 ease-in-out" />
              )}

              {/** DROP DOWN OF ALL ESPISODES */}
              {showEpisodesDropDown ? (
                <motion.div
                  initial={{ y: -25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={
                    "absolute py-2 bg-gray-200 custom-scrollbar dark:bg-neutral-800 top-[110%] w-full h-fit max-h-[250px] overflow-auto flex flex-col z-[56] " +
                    " right-0"
                  }
                >
                  {currentSeasonIfo?.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={
                        "min-w-0 w-full edp select-none dp hover:bg-gray-300 dark:hover:bg-zinc-600 px-4 py-3 " +
                        (currentEpisodeNum === episode.episode_number
                          ? " bg-gray-300 dark:bg-zinc-600"
                          : "")
                      }
                      onClick={() => {
                        setCurrentEpisodeNum(episode.episode_number);
                        setRetryCount(retryCount + 1);
                      }}
                    >
                      {episode.name}
                    </div>
                  ))}
                </motion.div>
              ) : null}
            </div>
          </div>
          {/** EPISODE DATA */}

          {currentSeasonIfo && currentEpisodeNum !== null ? (
            <Episode
              seriesId={mediaDetails?.id}
              seasonNum={currentChosenSeason?.season_number}
              episodeNum={currentEpisodeNum}
              retryCount={retryCount}
            />
          ) : null}
        </div>
      ) : null}
      <ActionButtons lang={lang} media={mediaDetails} media_type={media_type} />
      <RecommendedCarousel movies={recommendedData.results} lang={lang} />
      <ReviewsSection reviews={reviewsData.results} lang={lang} />
    </div>
  );
};

export default Movie;
