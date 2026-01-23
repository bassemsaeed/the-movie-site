import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Info,
  Play,
} from "lucide-react";
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

  // State
  const [category, setCategory] = useState("movie");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [details, setDetails] = useState({
    loading: false,
    data: null,
    error: null,
    keywords: null,
  });
  const [isLiked, setIsLiked] = useState(false);

  // Fetch Trending Data
  const {
    data: trendingData,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(`${API_BASE_URL}trending?k=${category}`, {
    lang,
    retryCount,
  });

  const items = trendingData?.results || [];
  const currentItem = items[currentIndex];

  // Reset index on category change
  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  // Check LocalStorage for Like Status
  useEffect(() => {
    if (!currentItem) return;
    const likedList = JSON.parse(localStorage.getItem("likedMedia") || "[]");
    setIsLiked(likedList.some((item) => item.id === currentItem.id));
  }, [currentItem]);

  // Fetch Extra Details (Logos, Keywords)
  useEffect(() => {
    if (!currentItem) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDetails = async () => {
      setDetails((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const [mediaRes, keywordsRes] = await Promise.all([
          fetch(`${API_BASE_URL}media/${category}/${currentItem.id}`, {
            signal,
          }).then((res) => res.json()),
          axios.get(
            `${API_BASE_URL}${category === "movie" ? "movie" : "tv"}/${currentItem.id}/keywords`
          ),
        ]);

        setDetails({
          loading: false,
          data: mediaRes,
          keywords:
            category === "movie"
              ? keywordsRes.data.keywords
              : keywordsRes.data.results,
          error: null,
        });
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setDetails((prev) => ({ ...prev, loading: false, error: err }));
        }
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [currentItem, category]);

  // Handlers
  const handleNavigate = (direction) => {
    if (direction === "next") {
      setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    } else {
      setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    }
  };

  const toggleLike = () => {
    const likedList = JSON.parse(localStorage.getItem("likedMedia") || "[]");
    let newList;
    if (isLiked) {
      newList = likedList.filter((i) => i.id !== currentItem.id);
    } else {
      const itemToSave = {
        ...currentItem,
        mediaKeywords: details.keywords?.slice(0, 10),
      };
      newList = [...likedList, itemToSave];
    }
    localStorage.setItem("likedMedia", JSON.stringify(newList));
    setIsLiked(!isLiked);
  };

  // Loading / Error States
  if (trendingLoading && !trendingData) return <SkeletonLoader />;
  if (trendingError) return <ErrorState lang={lang} />;
  if (!currentItem) return null;

  return (
    // Changed to h-full to fit the parent grid cell in Hero.jsx perfectly
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-neutral-900 group shadow-2xl">

      {/* 1. BACKGROUND LAYER */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={BASE_MEDIA_URL + currentItem.backdrop_path}
            alt={currentItem.title || currentItem.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent z-10" />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${lang === "ar"
                ? "from-transparent via-neutral-900/30 to-neutral-900/80"
                : "from-neutral-900/80 via-neutral-900/30 to-transparent"
              } z-10`}
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. CONTENT LAYER */}
      {/* Reduced padding specifically for <450px screens (px-4 pb-8) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-8 px-4 md:px-12 md:pb-12 lg:px-16">
        <SlideInfo
          lang={lang}
          item={currentItem}
          details={details}
          isLiked={isLiked}
          onLike={toggleLike}
          onOpen={() =>
            navigate(
              `/${category === "movie" ? "movies" : "series"}/${currentItem.id}${lang === "ar" ? "?l=ar" : ""
              }`
            )
          }
        />
      </div>

      {/* 3. TOP CONTROLS */}
      {/* Scaled down for mobile to avoid covering content */}
      <div className="absolute top-3 right-3 md:top-6 md:right-6 z-30 transform scale-75 origin-top-right md:scale-100">
        <CategoryToggle
          lang={lang}
          category={category}
          setCategory={setCategory}
        />
      </div>

      {/* 4. NAVIGATION ARROWS (Hidden on mobile) */}
      <div className="absolute inset-y-0 left-4 z-30 hidden md:flex items-center">
        <NavButton
          icon={<ArrowLeft size={24} />}
          onClick={() => handleNavigate(lang === "ar" ? "next" : "prev")}
        />
      </div>
      <div className="absolute inset-y-0 right-4 z-30 hidden md:flex items-center">
        <NavButton
          icon={<ArrowRight size={24} />}
          onClick={() => handleNavigate(lang === "ar" ? "prev" : "next")}
        />
      </div>

      {/* 5. PAGINATION */}
      <div className="absolute bottom-3 left-0 right-0 z-30 px-4 md:px-16">
        <Pagination
          total={items.length}
          current={currentIndex}
          onChange={setCurrentIndex}
        />
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const SlideInfo = ({ lang, item, details, isLiked, onLike, onOpen }) => {
  const logoPath = useMemo(() => {
    if (!details.data?.logos) return null;
    const enLogo = details.data.logos.find((l) => l.iso_639_1 === "en");
    return enLogo ? enLogo.file_path : details.data.logos[0]?.file_path;
  }, [details.data]);

  const title = item.title || item.name;

  return (
    <div
      className={`max-w-2xl flex flex-col gap-1.5 md:gap-4 ${lang === "ar" ? "items-start text-right" : "items-start text-left"
        }`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Title / Logo Area */}
      {/* Adjusted heights: h-12 on mobile vs h-28 on desktop */}
      <div className="h-12 md:h-28 flex items-end mb-1">
        {details.loading ? (
          <div className="h-6 w-32 md:h-8 md:w-48 bg-white/20 animate-pulse rounded-md" />
        ) : logoPath ? (
          <motion.img
            key={logoPath}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src={BASE_LOGO_URL + logoPath}
            alt={title}
            // Max width restricted on mobile
            className="max-h-full max-w-[140px] md:max-w-[350px] object-contain drop-shadow-xl"
          />
        ) : (
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // Smaller font on mobile (2xl) vs desktop (5xl)
            className="font-ar font-black text-2xl md:text-5xl text-white drop-shadow-lg leading-tight line-clamp-1"
          >
            {title}
          </motion.h1>
        )}
      </div>

      {/* Overview */}
      <motion.p
        key={item.overview}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        // Significantly smaller text and tighter clamp for mobile
        className="font-ar text-gray-200 text-[10px] xs:text-xs md:text-base line-clamp-2 leading-relaxed max-w-lg drop-shadow-md"
      >
        {item.overview}
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        // Tighter gap
        className="flex items-center gap-2 mt-2 md:mt-4"
      >
        <button
          onClick={onOpen}
          // Compact padding (px-3 py-1.5) and text size (text-xs) for mobile
          className="group relative px-3 py-1.5 md:px-6 md:py-3 rounded-xl bg-white text-black font-bold font-ar text-xs md:text-base flex items-center gap-1.5 md:gap-2 hover:bg-gray-200 transition-all active:scale-95"
        >
          <Play className="w-3 h-3 md:w-5 md:h-5" fill="currentColor" />
          <span>{getTextByLang(lang, "مشاهدة", "Watch")}</span>
        </button>

        <button
          onClick={onLike}
          className="px-3 py-1.5 md:px-6 md:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-ar font-medium text-xs md:text-base flex items-center gap-1.5 md:gap-2 hover:bg-white/20 transition-all active:scale-95"
        >
          <Heart
            className={`w-3 h-3 md:w-5 md:h-5 ${isLiked ? "text-rose-500 fill-rose-500" : ""
              }`}
          />
          <span className="hidden xs:inline">
            {isLiked
              ? getTextByLang(lang, "مضاف", "Added")
              : getTextByLang(lang, "قائمتي", "List")}
          </span>
        </button>

        <button
          onClick={onOpen}
          className="p-1.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <Info className="w-3 h-3 md:w-5 md:h-5" />
        </button>
      </motion.div>
    </div>
  );
};

const CategoryToggle = ({ lang, category, setCategory }) => (
  <div className="flex p-1 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full shadow-xl">
    {["movie", "tv"].map((cat) => {
      const isActive = category === cat;
      const label =
        cat === "movie"
          ? getTextByLang(lang, "أفلام", "Movies")
          : getTextByLang(lang, "مسلسلات", "TV"); // Shortened label for mobile

      return (
        <button
          key={cat}
          onClick={() => !isActive && setCategory(cat)}
          className={`relative px-3 py-1 md:px-5 md:py-1.5 rounded-full text-xs md:text-sm font-ar font-medium transition-all duration-300 ${isActive ? "text-white" : "text-gray-400 hover:text-white"
            }`}
        >
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-rose-600 rounded-full shadow-lg shadow-rose-600/30"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      );
    })}
  </div>
);

const Pagination = ({ total, current, onChange }) => (
  <div className="flex items-center gap-1.5 h-1">
    {Array.from({ length: total }).map((_, idx) => (
      <button
        key={idx}
        onClick={() => onChange(idx)}
        className={`h-0.5 md:h-1 rounded-full transition-all duration-300 ${idx === current
            ? "w-4 md:w-8 bg-rose-500"
            : "w-2 md:w-4 bg-white/30 hover:bg-white/60"
          }`}
        aria-label={`Go to slide ${idx + 1}`}
      />
    ))}
  </div>
);

const NavButton = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-sm border border-white/5 text-white transition-all transform hover:scale-110 active:scale-95 group"
  >
    {React.cloneElement(icon, {
      className: "opacity-70 group-hover:opacity-100 transition-opacity",
    })}
  </button>
);

const SkeletonLoader = () => (
  <div className="w-full h-full bg-neutral-900 rounded-2xl animate-pulse relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-900 animate-shimmer" />
    <div className="absolute bottom-8 left-4 md:bottom-12 md:left-12 space-y-3">
      <div className="h-8 md:h-10 w-32 md:w-64 bg-neutral-700 rounded-lg" />
      <div className="h-3 md:h-4 w-48 md:w-96 bg-neutral-800 rounded-lg" />
      <div className="flex gap-3 pt-2">
        <div className="h-8 md:h-12 w-20 md:w-32 bg-neutral-700 rounded-xl" />
        <div className="h-8 md:h-12 w-20 md:w-32 bg-neutral-800 rounded-xl" />
      </div>
    </div>
  </div>
);

const ErrorState = ({ lang }) => (
  <div className="w-full h-full bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-neutral-500">
    <Info size={32} className="mb-4 opacity-50" />
    <p className="font-ar text-sm text-center px-4">
      {getTextByLang(lang, "تعذر تحميل المحتوى", "Could not load content")}
    </p>
  </div>
);

export default Trending;