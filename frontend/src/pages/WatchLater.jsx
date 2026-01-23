import React, { useState, useEffect, useMemo } from "react";
import useTheme from "../hooks/useTheme";
import { ThemeHeader } from "../components/ThemeHeader";
import { getTextByLang } from "../utils";
import { useNavigate, useNavigation } from "react-router";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w300/";

/**
 * Empty State Component
 * Displays a friendly message and icon when lists are empty.
 */
const EmptyState = ({ lang }) => (
  <div className="flex flex-col items-center justify-center h-full text-center opacity-80 mt-20">
    <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-4 shadow-inner">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-gray-400 dark:text-neutral-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
        />
      </svg>
    </div>
    <h3 className="font-ar text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
      {getTextByLang(lang, "قوائمك فارغة", "Your lists are empty")}
    </h3>
    <p className="font-ar text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
      {getTextByLang(
        lang,
        "ابدأ بإضافة الأفلام والعروض التي تحبها إلى مكتبتك.",
        "Start adding movies and shows you love to your library."
      )}
    </p>
  </div>
);

/**
 * Media Card Component
 * Handles display, hover effects, and individual item actions.
 */
const MediaCard = React.memo(({ item, onRemove, navigate, lang }) => {
  const mediaType = item.media_type === "tv" ? "series" : "movies";
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  const title = item.title || item.name || item.original_name;
  const year =
    item.release_date?.substring(0, 4) || item?.first_air_date?.substring(0, 4);

  return (
    <div
      className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl bg-gray-200 dark:bg-neutral-800 aspect-[2/3] cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsOverlayVisible(true)}
      onMouseLeave={() => setIsOverlayVisible(false)}
      onClick={() => setIsOverlayVisible(true)}
    >
      {/* Poster Image with Zoom Effect */}
      <img
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        src={
          item.poster_path
            ? BASE_IMAGE_URL + item.poster_path
            : "https://via.placeholder.com/300x450?text=No+Image"
        }
        loading="lazy"
        alt={`${title} poster`}
      />

      {/* Cinematic Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 text-white
                   transition-opacity duration-300 flex flex-col justify-between
                   ${isOverlayVisible
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
          }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOverlayVisible(false);
        }}
      >
        {/* Top: Remove Action */}
        <div className="flex justify-end pt-1 pr-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="p-2 rounded-full bg-black/40 hover:bg-red-600 backdrop-blur-sm text-white transition-all duration-200 transform hover:scale-105"
            title={getTextByLang(lang, "إزالة", "Remove")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Bottom: Info & Details Action */}
        <div className="flex items-end justify-between gap-3 pb-1">
          <div className="flex-1 min-w-0 font-ar text-shadow-sm">
            <h3 className="font-bold text-sm md:text-base leading-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-gray-300 mt-1 font-medium">
              {year || "N/A"}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                `/${mediaType}/${item.id}${lang === "ar" ? "?l=ar" : ""}`
              );
            }}
            className="flex-shrink-0 p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all duration-200 transform hover:scale-105 active:scale-95"
            title={getTextByLang(lang, "عرض التفاصيل", "View Details")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * Section Container Component
 * Renders a titled section with a grid of cards.
 */
const MediaSection = ({ title, items, onRemove, navigate, lang }) => {
  if (!items || items.length === 0) return null;
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-5 border-b border-gray-200 dark:border-neutral-800 pb-2">
        <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
        <h2 className="font-ar text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
        <span className="text-sm font-medium text-gray-400 dark:text-neutral-500 mt-1">
          ({items.length})
        </span>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onRemove={onRemove}
            navigate={navigate}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
};

const WatchLater = () => {
  const { lang } = useTheme();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const [likedMedia, setLikedMedia] = useState([]);
  const [watchLaterMedia, setWatchLaterMedia] = useState([]);

  // Load data on mount
  useEffect(() => {
    const loadedLiked = JSON.parse(localStorage.getItem("likedMedia")) || [];
    const loadedWatchLater =
      JSON.parse(localStorage.getItem("watchLaterMedia")) || [];

    setLikedMedia(loadedLiked);
    setWatchLaterMedia(loadedWatchLater);
  }, []);

  // Generic handler to update state and local storage
  const updateList = (listName, currentList, itemIdToRemove, setListState) => {
    const updatedList = currentList.filter((item) => item.id !== itemIdToRemove);
    setListState(updatedList);
    localStorage.setItem(listName, JSON.stringify(updatedList));
  };

  const hasContent = likedMedia.length > 0 || watchLaterMedia.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <ThemeHeader />

      {/* Loading Indicator */}
      {isNavigating && (
        <div dir="ltr" className="fixed top-0 left-0 w-full h-[3px] z-[60]">
          <div className="h-full bg-rose-500 animate-slide w-[30%] shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8 h-[calc(100vh-68px)] overflow-y-auto custom-scrollbar ${!hasContent ? "flex items-center justify-center" : ""
          }`}
      >
        {hasContent ? (
          <div className="flex flex-col gap-12 pb-10">
            <MediaSection
              title={getTextByLang(lang, "قائمة الاعجاب", "Liked")}
              items={likedMedia}
              onRemove={(id) =>
                updateList("likedMedia", likedMedia, id, setLikedMedia)
              }
              navigate={navigate}
              lang={lang}
            />

            <MediaSection
              title={getTextByLang(lang, "قائمة المشاهده لاحقا", "Watch Later")}
              items={watchLaterMedia}
              onRemove={(id) =>
                updateList(
                  "watchLaterMedia",
                  watchLaterMedia,
                  id,
                  setWatchLaterMedia
                )
              }
              navigate={navigate}
              lang={lang}
            />
          </div>
        ) : (
          <EmptyState lang={lang} />
        )}
      </main>
    </div>
  );
};

export default WatchLater;