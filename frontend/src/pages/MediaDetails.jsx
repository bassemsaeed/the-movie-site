import { motion } from "framer-motion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate, useNavigation } from "react-router";
import useTheme from "../hooks/useTheme";
import { getTextByLang } from "../utils";
import axios from "axios";
import {
  ArrowDown,
  BadgeInfo,
  BookmarkMinus,
  BookmarkPlus,
  Calendar,
  Clock,
  Film,
  Heart,
  HeartOff,
  Share2,
  Star,
  User,
} from "lucide-react";
import Episode from "../components/Episode";
import { ThemeHeader } from "../components/ThemeHeader";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/";

const getImageUrl = (
  path,
  size = "original",
  fallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAWlBMVEXv8fNod4f19vhkdIRcbX52g5KPmqX29/iYoq3l6OuCj5vd4eTr7fBfcIFaa33M0dbBx82SnKe7wchtfIt8iZejq7TU2N2Ik6CwuL/Gy9Gqsrqbpa/P1NmhqrNz0egRAAADBklEQVR4nO3c63KqMBRAYUiwwUvEete27/+ax1tVAqhwEtnprO+XM62Oyw2CGTFJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJe6Mb5vqL7jjsws/wgln/dddzBZZjocuxj2HaiWNg1JL/oO3GVBA9PUzvvdF80q7AgPQ/zot1DlOnThyFBIIYWvFtrMK3mFdj30aWzFFWZjr+/qE4mFXh+YwrehsDMK34bCzmIoVEad1nC6PbD8QpXMNwOdDvKi2xMUX2jm2h7/onU2WHcZo/RCld8WN3TWZR1CeKH6LK1tTGftE2UXqpmzPGXbLwnKLkzcT8X6s/UQRReqWWX9LWs9RNGF5qOysmFb74miC9XCDUzt6k8VJtXC9jsihW9Tu5Uuq/vhvlKokuGjc1bRhWZVLdw5MWq8mU6zfNL4wKILk/W0spW6dyvOZ61p4wKd7EIzcoZot+UQVVxeA62bEmUXJuPyIV8PnDsVtxXtpikKL1S7++1U6/IZzV1g8xSFFx4i9HWMdjksNZQCGxOlFyZq8jW1VmubpZV90PngUZ8ovvDYuNt//Wy/1ZPAhsQICo+rUMa4T70msP7tJorCun8vKofKhilGWlg7wfopxlnYMMHaKUZZ2DjBuinGWPgwsDLFCAufBLqJ8RU+DXQ21OgKXwgsTzG2wpcCj1O8nsJGVvjgMNE0xbgKX5zgeYqXxKgKX57geYrnDTWmwhYTvJtiRIUtA3/fbuIpbB14mWI0hR0Cz1OMpbBT4CkxiaOwY+BpQ42isNVhwk283hJc2HmC5Va5hf8xwTgK/UxQcKGvQLGF3gKlFvoLFFroMVBmoc9AkYWeDhNyC1Xh9aJLeYV+Jyiw0Os+KLHQe6C0Qv+BwgoDBMoqDBEoqtCECJRUOPz2e5gQV2jnYa7qllOYBvr5CEGFgVBIIYXPmJ/ghZueZ+hexOWd+w3q9ycuwg5R2377DsapDflbX7rTFah+TbajQSij/aT/wNNF26FUvoELAAAAAAAAAAAAAAAAAAAAAAAAAAAA4G/4B9L3P1vg3y4/AAAAAElFTkSuQmCC",
) => {
  return path ? `${BASE_IMAGE_URL}${size}${path}` : fallback;
};

const ActorCard = React.memo(({ actor }) => {
  return (
    <div className="w-40 flex-shrink-0 snap-start select-none">
      <div className="group flex flex-col gap-2">
        <div className="aspect-[2/3] w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden relative">
          {actor.profile_path ? (
            <img
              src={getImageUrl(actor.profile_path, "w500")}
              alt={actor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-300 dark:bg-neutral-700">
              <User className="w-12 h-12 text-neutral-500" />
            </div>
          )}
        </div>
        <div className="pr-2">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
            {actor.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {actor.character}
          </p>
        </div>
      </div>
    </div>
  );
});

const CreditsSkeleton = () => (
  <div className="flex space-x-4 overflow-hidden -mx-4 px-4 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="w-40 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <div className="aspect-[2/3] w-full bg-neutral-300 dark:bg-neutral-700 rounded-lg"></div>
          <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4"></div>
          <div className="h-3 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

const CreditsSection = React.memo(({ credits, loading, error, lang }) => {
  const scrollContainerRef = useRef(null);

  if (error) return null;
  if (!loading && (!credits || credits.cast.length === 0)) return null;

  const keyJobs = [
    "Director",
    "Screenplay",
    "Writer",
    "Series Composition",
    "Original Music Composer",
    "Novel",
    "Series Director",
  ];
  const keyCrew =
    credits?.crew.filter((member) => keyJobs.includes(member.job)) || [];

  const uniqueCrew = Array.from(
    new Map(keyCrew.map((item) => [item["id"], item])).values(),
  );

  return (
    <Section title={getTextByLang(lang, "فريق العمل", "Cast & Crew")}>
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-4">
            {getTextByLang(lang, "أبرز الممثلين", "Top Billed Cast")}
          </h3>
          {loading ? (
            <CreditsSkeleton />
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex hidden-scrollbar space-x-4 overflow-x-auto scroll-snap-x-mandatory scroll-smooth hide-scrollbar -mx-4 px-4"
            >
              {credits.cast.map((actor) => (
                <ActorCard key={actor.credit_id || actor.id} actor={actor} />
              ))}
            </div>
          )}
        </div>

        {uniqueCrew.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-4">
              {getTextByLang(lang, "الطاقم الرئيسي", "Key Crew")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6">
              {uniqueCrew.map((member) => (
                <div key={member.credit_id}>
                  <p className="font-semibold text-neutral-800 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {member.job}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
});

const formatRuntime = (minutes, lang) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return lang === "ar" ? `${mins}دقيقه` : `${mins}m`;
  return lang === "ar" ? `${hours} ساعه ${mins} دقيقه` : `${hours}h ${mins}m`;
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

const MediaHeder = React.memo(
  ({ media, lang, media_type, loadingMedia, errLoading, mediaKeywords }) => (
    <div className="relative pt-16">
      <div className="absolute inset-0 h-[60vh] md:h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getImageUrl(media.backdrop_path)})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-50 via-neutral-50/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-48 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <aside className="md:col-span-1 -mt-12 md:-mt-32">
            {loadingMedia ? (
              <div className="rounded-xl shadow-2xl shadow-black/40 w-full aspect-[2/3] bg-gray-600/30 animate-pulse flex justify-center items-center">
                <div className="w-10 h-10 border-4 mask-conic-from-75% mask-conic-to-75% border-rose-500 animate-spin rounded-full"></div>
              </div>
            ) : (
              <img
                src={getImageUrl(media.poster_path, "w500")}
                alt={`${media.title} Poster`}
                className="rounded-xl shadow-2xl shadow-black/40 w-full aspect-[2/3] object-cover"
              />
            )}
          </aside>
          <main className="md:col-span-2 flex flex-col justify-end">
            <div className="text-black dark:text-white">
              {loadingMedia ? (
                <div className="w-10 h-10 border-4 mask-conic-from-75% mask-conic-to-75% border-rose-500 animate-spin rounded-full"></div>
              ) : errLoading ? (
                <div className="dark:text-white font-ar text-[15px]">
                  {getTextByLang(
                    lang,
                    "لقد حدث خطأ",
                    "An unexpected error has happend",
                  )}
                </div>
              ) : (
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                  {media.title || media.name || media.original_name}
                </h1>
              )}
              {media.tagline && (
                <p className="text-lg italic text-neutral-600 dark:text-neutral-300 mt-2 mb-6">
                  "{media.tagline}"
                </p>
              )}
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-100">
                  {getTextByLang(lang, "ملخص", "Overview")}
                </h3>
                {loadingMedia ? (
                  <div className="w-10 h-10 border-4 mask-conic-from-75% mask-conic-to-75% border-rose-500 animate-spin rounded-full"></div>
                ) : errLoading ? (
                  <div className="dark:text-white font-ar text-[15px]">
                    {getTextByLang(
                      lang,
                      "لقد حدث خطأ",
                      "An unexpected error has happend",
                    )}
                  </div>
                ) : (
                  <p className="leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {getTextByLang(
                      lang,
                      media.overview || "لايوجد وصف متاح باللغة العربية.",
                      media.overview || "No overview available in english.",
                    )}
                  </p>
                )}
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

              <div className="mt-8">
                <ActionButtons
                  lang={lang}
                  media={media}
                  media_type={media_type}
                  mediaKeywords={mediaKeywords}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  ),
);

const MediaStats = React.memo(({ media, media_type }) => {
  const { lang } = useTheme();

  return (
    <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700/50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <StatPill
          icon={<Star color="gold" />}
          label={getTextByLang(lang, "التقييم", "RATING")}
          value={`${media.vote_average?.toFixed(1) || "N/A"} / 10`}
        />
        <StatPill
          icon={<Clock />}
          label={getTextByLang(
            lang,
            media_type === "movie" ? "مدة الفيلم" : "المواسم",
            media_type === "movie" ? "RUNTIME" : "SEASONS",
          )}
          value={
            media_type === "movie"
              ? formatRuntime(media.runtime, lang)
              : media.number_of_seasons
          }
        />
        <StatPill
          icon={<Calendar color="orange" />}
          label={getTextByLang(lang, "السنة", "YEAR")}
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
          label={getTextByLang(lang, "النوع", "Category")}
          value={media_type === "tv" ? "Series" : "Movie"}
        />
        <StatPill
          icon={<Film color="red" />}
          label={getTextByLang(lang, "الحالة", "STATUS")}
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

const ActionButtons = ({ lang, media, media_type, mediaKeywords }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSavedInWatchLater, setIsSavedInWatchLater] = useState(false);

  useLayoutEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedMedia") || "[]")?.find(
      (item) => item?.id === media?.id,
    );

    const IS_SAVED_IN_WATCHLATER = JSON.parse(
      localStorage.getItem("watchLaterMedia") || "[]",
    ).find((item) => item?.id === media?.id);

    if (IS_SAVED_IN_WATCHLATER) {
      setIsSavedInWatchLater(true);
    } else {
      setIsSavedInWatchLater(false);
    }

    setIsLiked(Boolean(liked));
  }, [media.id]);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="flex items-center justify-center gap-2 outline-none select-none py-2 px-5 rounded-lg bg-rose-500 hover:bg-rose-600 duration-150 font-semibold text-white cursor-pointer shadow-lg shadow-rose-500/20"
        onClick={() => {
          const storedLikedMedia =
            JSON.parse(localStorage.getItem("likedMedia")) || [];

          if (isLiked) {
            const newLikedList = storedLikedMedia.filter(
              (item) => item.id !== media.id,
            );
            localStorage.setItem("likedMedia", JSON.stringify(newLikedList));
            setIsLiked(false);
          } else {
            media.media_type = media_type;
            if (media_type === "movie") {
              media.mediaKeywords =
                mediaKeywords?.keywords && mediaKeywords?.keywords.length > 6
                  ? mediaKeywords?.keywords?.slice(0, 6)
                  : mediaKeywords?.keywords;
            } else {
              media.mediaKeywords =
                mediaKeywords?.results && mediaKeywords?.results.length > 6
                  ? mediaKeywords?.results?.slice(0, 6)
                  : mediaKeywords?.results;
            }
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
          const WATCHLATER_LIST =
            JSON.parse(localStorage.getItem("watchLaterMedia")) || [];

          if (isSavedInWatchLater) {
            const UPDATED_WATCHLATER_LIST = WATCHLATER_LIST.filter(
              (item) => item?.id !== media?.id,
            );
            localStorage.setItem(
              "watchLaterMedia",
              JSON.stringify(UPDATED_WATCHLATER_LIST),
            );
            setIsSavedInWatchLater(false);
          } else {
            if (media_type === "movie") {
              media.mediaKeywords =
                mediaKeywords?.keywords && mediaKeywords?.keywords.length > 6
                  ? mediaKeywords?.keywords?.slice(0, 6)
                  : mediaKeywords?.keywords;
            } else {
              media.mediaKeywords =
                mediaKeywords?.results && mediaKeywords?.results.length > 6
                  ? mediaKeywords?.results?.slice(0, 6)
                  : mediaKeywords?.results;
            }
            WATCHLATER_LIST.push(media);
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

const Movie = () => {
  const { results, media_type } = useLoaderData();
  const { lang } = useTheme();

  const details = results?.[0]?.value?.data || null;
  const [mediaDetails, setMediaDetails] = useState(details);
  const [loadingMediaDetails, setLoadingMediaDetails] = useState(!details);
  const [errLoadingMediaDetails, setErrLoadingMediaDetails] = useState(null);

  const reviewsData = results?.[1]?.value?.data || { results: [] };

  const recommended = results?.[2]?.value?.data || null;
  const [recommendedData, setRecommendedData] = useState(recommended);

  // NEW: State for credits
  const [creditsData, setCreditsData] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [errorCredits, setErrorCredits] = useState(null);

  const mediaKeywords = results?.[4].value?.data || null;

  // ... (rest of the state declarations remain the same)
  const seasons =
    media_type === "tv" && mediaDetails?.seasons?.length > 0
      ? mediaDetails.seasons.filter((s) => s.episode_count > 0)
      : null;

  const mainElRef = useRef(null);
  const seasonsDropdownRef = useRef(null);
  const episodesDropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        seasonsDropdownRef.current &&
        !seasonsDropdownRef.current.contains(event.target)
      ) {
        setShowSeasonsDropDown(false);
      }
      if (
        episodesDropdownRef.current &&
        !episodesDropdownRef.current.contains(event.target)
      ) {
        setShowEpisodesDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    setCurrentChosenSeasonIndex(0);
    setShowSeasonsDropDown(false);
    setShowEpisodesDropDown(false);
    setCurrentEpisodeNum(null);
    setMediaDetails(details);
    setRecommendedData(recommended);
    if (mainElRef.current) {
      mainElRef.current.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [details?.id, mainElRef, details, recommended]);

  useEffect(() => {
    if (!details?.id) return;

    (async () => {
      try {
        // ... (url history replacement remains the same)
        const newUrl = new URL(window.location.href);
        if (lang === "ar") newUrl.searchParams.set("l", "ar");
        else newUrl.searchParams.delete("l");
        history.replaceState(null, "", newUrl.href);

        // Set all loading states to true
        setLoadingMediaDetails(true);
        setLoadingCredits(true);
        setErrorCredits(null);
        setErrLoadingMediaDetails(null);

        const mediaTypeEndpoint = media_type === "movie" ? "movies" : "series";

        const results = await Promise.allSettled([
          axios.get(
            `http://localhost:3000/${mediaTypeEndpoint}/${details.id}?l=${lang}`,
          ),
          axios.get(
            `http://localhost:3000/recommended/${details.id}?k=${media_type}&l=${lang}`,
          ),
          // NEW: Fetch credits data
          axios.get(
            `http://localhost:3000/${media_type}/${details.id}/credits?l=${lang}`,
          ),
        ]);

        // Handle Media Details
        if (results[0].status === "fulfilled") {
          setMediaDetails(results[0].value.data);
        } else {
          setErrLoadingMediaDetails(results[0].reason);
        }

        // Handle Recommended
        if (results[1].status === "fulfilled") {
          setRecommendedData(results[1].value.data);
        }

        // Handle Credits
        if (results[2].status === "fulfilled") {
          setCreditsData(results[2].value.data);
        } else {
          setErrorCredits(results[2].reason);
        }
      } catch (error) {
        // General catch block, though Promise.allSettled is safer
        setErrLoadingMediaDetails(error);
        setErrorCredits(error);
      } finally {
        setLoadingMediaDetails(false);
        setLoadingCredits(false);
      }
    })();
  }, [lang, media_type, details?.id]);

  useEffect(() => {
    if (!currentChosenSeason || !mediaDetails?.id) {
      setCurrentSeasonIfo(null);
      return;
    }

    const controller = new AbortController();

    async function getSeasonData() {
      const params = new URLSearchParams();
      if (lang === "ar") {
        params.append("l", "ar");
      }
      const url = `http://localhost:3000/season/${mediaDetails.id}/${currentChosenSeason.season_number}?${params.toString()}`;

      try {
        setLoadingCurrentSeasonIfo(true);
        setErrLoadingCurrentSeasonIfo(null);
        setCurrentSeasonIfo(null);

        const { data } = await axios.get(url, {
          signal: controller.signal,
        });

        setCurrentSeasonIfo(data);
        if (data.episodes.length > 0)
          setCurrentEpisodeNum(data.episodes[0].episode_number);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        setErrLoadingCurrentSeasonIfo(error);
      } finally {
        setLoadingCurrentSeasonIfo(false);
      }
    }

    getSeasonData();

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
      <ThemeHeader />

      <MediaHeder
        media={mediaDetails}
        loadingMedia={loadingMediaDetails}
        errLoading={errLoadingMediaDetails}
        media_type={media_type}
        lang={lang}
        mediaKeywords={mediaKeywords}
      />

      {seasons ? (
        <div className="max-w-7xl dark:text-white font-ar mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-4 my-8">
          <h2 className="font-bold text-3xl tracking-tight text-neutral-800 dark:text-neutral-100">
            {getTextByLang(lang, "المواسم والحلقات", "Seasons & Episodes")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Seasons Dropdown */}
            <div className="relative" ref={seasonsDropdownRef}>
              <button
                className="w-full h-[50px] px-4 py-3 bg-neutral-100 dark:bg-neutral-800 font-semibold text-black dark:text-white cursor-pointer items-center justify-between flex rounded-lg"
                onClick={() => setShowSeasonsDropDown(!showSeasonsDropDown)}
              >
                <h3>
                  {currentChosenSeason?.name ||
                    getTextByLang(lang, "اختر موسماً", "Select a Season")}
                </h3>
                <ArrowDown
                  className={`transition-transform duration-200 ${showSeasonsDropDown ? "rotate-180" : ""}`}
                />
              </button>
              {showSeasonsDropDown && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute py-2 bg-neutral-200 dark:bg-neutral-800 top-[110%] w-full rounded-lg shadow-lg h-fit max-h-[250px] overflow-auto custom-scrollbar flex flex-col z-50"
                >
                  {seasons.map((season, i) => (
                    <div
                      key={season.id}
                      className={`w-full select-none hover:bg-neutral-300 dark:hover:bg-zinc-700 px-4 py-3 cursor-pointer ${currentChosenSeasonIndex === i ? "bg-neutral-300 dark:bg-zinc-700 font-bold" : ""}`}
                      onClick={() => {
                        setCurrentChosenSeasonIndex(i);
                        setShowSeasonsDropDown(false);
                      }}
                    >
                      {season.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
            {/* Episodes Dropdown */}
            <div
              className="relative dark:text-white font-ar"
              ref={episodesDropdownRef}
            >
              <button
                className="w-full h-[50px] px-4 py-3 bg-neutral-100 dark:bg-neutral-800 font-semibold text-black dark:text-white cursor-pointer items-center justify-between flex rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowEpisodesDropDown(!showEpisodesDropDown)}
                disabled={
                  loadingCurrentSeasonIfo ||
                  !currentSeasonIfo?.episodes ||
                  currentSeasonIfo.episodes.length === 0
                }
              >
                {loadingCurrentSeasonIfo ? (
                  <div className="w-5 h-5 rounded-full border-2 border-neutral-400 dark:border-white border-t-rose-500 dark:border-t-rose-500 animate-spin"></div>
                ) : (
                  <h3>
                    {currentSeasonIfo?.episodes?.find(
                      (e) => e.episode_number === currentEpisodeNum,
                    )?.name ||
                      getTextByLang(lang, "اختر حلقة", "Select an Episode")}
                  </h3>
                )}
                <ArrowDown
                  className={`transition-transform duration-200 ${showEpisodesDropDown ? "rotate-180" : ""}`}
                />
              </button>
              {showEpisodesDropDown && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute py-2 bg-neutral-200 custom-scrollbar dark:bg-neutral-800 top-[110%] w-full h-fit max-h-[250px] overflow-auto flex flex-col z-50 rounded-lg shadow-lg"
                >
                  {currentSeasonIfo?.episodes.map((episode) => (
                    <div
                      key={episode.id}
                      className={`min-w-0 w-full select-none hover:bg-neutral-300 dark:hover:bg-zinc-700 px-4 py-3 cursor-pointer ${currentEpisodeNum === episode.episode_number ? "bg-neutral-300 dark:bg-zinc-700 font-bold" : ""}`}
                      onClick={() => {
                        setCurrentEpisodeNum(episode.episode_number);
                        setShowEpisodesDropDown(false);
                        setRetryCount(retryCount + 1);
                      }}
                    >
                      {episode.name}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* EPISODE DATA */}
          <div className="mt-4">
            {currentSeasonIfo && currentEpisodeNum !== null ? (
              <Episode
                seriesId={mediaDetails?.id}
                seasonNum={currentChosenSeason?.season_number}
                episodeNum={currentEpisodeNum}
                retryCount={retryCount}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      <CreditsSection
        credits={creditsData}
        loading={loadingCredits}
        error={errorCredits}
        lang={lang}
      />

      <RecommendedCarousel
        movies={recommendedData?.results || []}
        lang={lang}
      />
      <ReviewsSection reviews={reviewsData.results} lang={lang} />
    </div>
  );
};

export default Movie;
