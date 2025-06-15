import React, { useState, useEffect } from "react";
import useTheme from "../hooks/useTheme";
import { ThemeHeader } from "../components/ThemeHeader";
import { getTextByLang } from "../utils";
import { useNavigate, useNavigation } from "react-router";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w300/";

const MediaCard = ({ item, onRemove, navigate, lang }) => {
  const mediaType = item.media_type === "tv" ? "series" : "movies";

  return (
    <div
      key={item.id}
      className="relative group rounded-lg overflow-hidden shadow-lg bg-gray-200 dark:bg-neutral-800 aspect-[2/3]"
    >
      <img
        className="w-full h-full object-cover"
        src={
          item.poster_path
            ? BASE_IMAGE_URL + item.poster_path
            : "https://via.placeholder.com/300x450?text=No+Image"
        }
        alt={item.title || item.name || item.original_name + " poster image."}
      />

      {/** INFO AND ACTION CARD OVERLAY */}
      <div
        className={`absolute top-0 left-0 h-full w-full bg-black/70 p-3 text-white
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   flex flex-col justify-between`}
      >
        {/* TOP ACTION: REMOVE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-red-500"
            aria-label={`Remove ${item.title} from list`}
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

        {/* BOTTOM INFO & ACTION */}
        <div className="flex justify-between items-end gap-2">
          <div className="font-ar flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">
              {item.title || item.name || item.original_name}
            </h3>
            <p className="text-sm text-gray-300 mt-1">
              {item.release_date?.substring(0, 4) ||
                item?.first_air_date.substring(0, 4)}
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                `/${mediaType}/${item.id}${lang === "ar" ? "?l=ar" : ""}`,
              )
            }
            className="flex-shrink-0 p-2 rounded-full bg-rose-500/90 hover:bg-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-rose-400"
            aria-label={`View details for ${item.title}`}
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
};

const WatchLater = () => {
  const { lang } = useTheme();
  const navigate = useNavigate();
  const [likedMedia, setLikedMedia] = useState([]);
  const [watchLaterMedia, setWatchLaterMedia] = useState([]);
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  useEffect(() => {
    const loadedLikedMedia =
      JSON.parse(localStorage.getItem("likedMedia")) || [];
    const loadedWatchLaterMedia =
      JSON.parse(localStorage.getItem("watchLaterMedia")) || [];

    setLikedMedia(loadedLikedMedia);
    setWatchLaterMedia(loadedWatchLaterMedia);
  }, []);

  const handleRemoveFromLiked = (itemIdToRemove) => {
    const updatedLikedMedia = likedMedia.filter(
      (item) => item.id !== itemIdToRemove,
    );
    setLikedMedia(updatedLikedMedia);
    localStorage.setItem("likedMedia", JSON.stringify(updatedLikedMedia));
  };

  const handleRemoveFromWatchLater = (itemIdToRemove) => {
    const updatedWatchLaterMedia = watchLaterMedia.filter(
      (item) => item.id !== itemIdToRemove,
    );
    setWatchLaterMedia(updatedWatchLaterMedia);
    localStorage.setItem(
      "watchLaterMedia",
      JSON.stringify(updatedWatchLaterMedia),
    );
  };

  const isThereLikedOrSavedMedia =
    likedMedia.length > 0 || watchLaterMedia.length > 0;

  return (
    <div className="w-screen h-screen bg-white dark:bg-neutral-900 relative">
      <ThemeHeader />
      <div
        className={
          "w-full h-[calc(100vh-68px)] overflow-x-hidden overflow-y-auto custom-scrollbar p-5 " +
          (!isThereLikedOrSavedMedia ? " flex justify-center items-center" : "")
        }
      >
        {isThereLikedOrSavedMedia ? (
          <div className="flex flex-col gap-8">
            {likedMedia.length > 0 && (
              <section>
                <h1 className="font-ar dark:text-white text-2xl mb-4">
                  {getTextByLang(lang, "قائمة الاعجاب", "Liked")}
                </h1>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                  {likedMedia.map((likedItem) => (
                    <MediaCard
                      key={likedItem.id}
                      item={likedItem}
                      onRemove={handleRemoveFromLiked}
                      navigate={navigate}
                      lang={lang}
                    />
                  ))}
                </div>
              </section>
            )}

            {watchLaterMedia.length > 0 && (
              <section>
                <h1 className="font-ar dark:text-white text-2xl mb-4">
                  {getTextByLang(lang, "قائمة المشاهده لاحقا", "Watch Later")}
                </h1>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                  {watchLaterMedia.map((watchLaterItem) => (
                    <MediaCard
                      key={watchLaterItem.id}
                      item={watchLaterItem}
                      onRemove={handleRemoveFromWatchLater}
                      navigate={navigate}
                      lang={lang}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="font-ar text-xl text-center text-gray-500 dark:text-gray-400">
            {getTextByLang(
              lang,
              "قوائمك فارغة. أضف بعض الأفلام أو العروض!",
              "Your lists are empty. Add some movies or shows!",
            )}
          </div>
        )}
      </div>

      {isNavigating && (
        <div dir={"ltr"} className="w-screen h-[3px] fixed top-0 z-[53]">
          <div className="w-[150px] bg-rose-500 animate-slide h-full"></div>
        </div>
      )}
    </div>
  );
};

export default WatchLater;
