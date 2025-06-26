import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import useTheme from "../hooks/useTheme";
import { Calendar, Clock, Star, User } from "lucide-react";
import { getTextByLang } from "../utils";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (path, size = "original", fallback = null) => {
  const placeholder =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjI3IiBoZWlnaHQ9IjEyNyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjwvc3ZnPg==";
  if (!path && !fallback) return placeholder;
  return path ? `${BASE_IMAGE_URL}${size}${path}` : fallback;
};

const formatRuntime = (minutes, lang) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return lang === "ar" ? `${mins} دقيقة` : `${mins}m`;
  return lang === "ar" ? `${hours}س ${mins}د` : `${hours}h ${mins}m`;
};

// Skeleton Component for Loading State
const EpisodeSkeleton = () => (
  <div className="w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 md:p-6 shadow-md border border-neutral-200 dark:border-neutral-700/60 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Image Skeleton */}
      <div className="md:col-span-1 bg-neutral-300 dark:bg-neutral-700 rounded-lg aspect-video"></div>
      {/* Content Skeleton */}
      <div className="md:col-span-2 flex flex-col gap-4">
        <div className="h-8 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4"></div>
        <div className="h-5 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2"></div>
        <div className="space-y-2 mt-4">
          <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded"></div>
          <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

const Episode = React.memo(
  ({ seriesId, seasonNum, episodeNum, retryCount }) => {
    const { lang } = useTheme();
    const [loading, setLoading] = useState(true);
    const [episodeData, setEpisodeData] = useState(null);
    const [error, setError] = useState(null);

    const getEpisodeData = useCallback(
      async (controller) => {
        try {
          setLoading(true);
          setError(null);
          const { data } = await axios.get(
            `${API_BASE_URL}episode/${seriesId}/${seasonNum}/${episodeNum}${lang === "ar" ? "?l=ar" : ""}`,
            { signal: controller.signal },
          );

          if (data.status === "error") {
            throw new Error(data.message || "Failed to load episode data.");
          }
          setEpisodeData(data);
        } catch (err) {
          if (!axios.isCancel(err)) {
            setError(err);
          }
        } finally {
          setLoading(false);
        }
      },
      [seriesId, seasonNum, episodeNum, lang],
    );

    useEffect(() => {
      const controller = new AbortController();

      // there could be a season 0 or episode 0 which would result in a false so i explicitly checked it s undefined
      if (
        seriesId !== undefined &&
        seasonNum !== undefined &&
        episodeNum !== undefined
      ) {
        getEpisodeData(controller);
      }
      return () => controller.abort();
    }, [getEpisodeData, seasonNum, episodeNum, seriesId, retryCount]); // retryCount triggers refetch

    if (loading) {
      return <EpisodeSkeleton />;
    }

    if (error) {
      return (
        <div className="w-full min-h-[200px] bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-lg font-semibold text-rose-500">
            {getTextByLang(lang, "حدث خطأ", "An Error Occurred")}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 mt-1">
            {getTextByLang(
              lang,
              "لم نتمكن من تحميل بيانات الحلقة.",
              "Could not load episode details.",
            )}
          </p>
        </div>
      );
    }

    if (!episodeData) return null;

    return (
      <div className="w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-4 md:p-6 shadow-md border border-neutral-200 dark:border-neutral-700/60">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <div className="lg:col-span-1">
            <img
              src={getImageUrl(episodeData.still_path, "w500")}
              alt={episodeData.name}
              className="w-full h-full object-cover rounded-lg aspect-video bg-neutral-300 dark:bg-neutral-700"
              loading="lazy"
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-2 flex flex-col">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-white">
              <span className="text-sky-500 dark:text-sky-400">
                E{episodeData.episode_number}
              </span>
              : {episodeData.name}
            </h2>

            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Star
                  className="text-yellow-500"
                  size={16}
                  fill="currentColor"
                />
                <span className="font-medium">
                  {episodeData.vote_average?.toFixed(1) || "N/A"}
                </span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">|</span>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span>{formatRuntime(episodeData.runtime, lang)}</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-600">|</span>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} />
                <span>
                  {episodeData.air_date
                    ? new Date(episodeData.air_date).toLocaleDateString(
                        lang === "ar" ? "ar-EG" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )
                    : "N/A"}
                </span>
              </div>
            </div>

            <p className="mt-4 text-neutral-700 dark:text-neutral-200 leading-relaxed line-clamp-4">
              {episodeData.overview ||
                getTextByLang(lang, "لا يتوفر ملخص.", "No overview available.")}
            </p>

            {/* Guest Stars */}
            {episodeData.guest_stars && episodeData.guest_stars.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-base font-bold text-neutral-800 dark:text-white mb-3">
                  {getTextByLang(lang, "ضيوف الشرف", "Guest Stars")}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {episodeData.guest_stars.slice(0, 5).map((star) => (
                    <div
                      key={star.id}
                      className="flex items-center h-fit gap-2 w-fit"
                    >
                      <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0 overflow-hidden">
                        {star.profile_path ? (
                          <img
                            src={getImageUrl(star.profile_path, "w185")}
                            alt={star.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-full h-full p-2 text-neutral-500" />
                        )}
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-neutral-800 dark:text-white truncate">
                          {star.name}
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 truncate">
                          {star.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default Episode;
