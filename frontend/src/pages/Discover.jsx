import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Play, Loader2, X, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { getTextByLang } from "../utils";
import useTheme from "../hooks/useTheme";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Helpers ---
function getMediaDataFiltered(mediaData) {
  if (!mediaData || !Array.isArray(mediaData) || mediaData.length < 2) return null;
  return [
    ...(mediaData[0].results || []).map((item) => ({ ...item, mediaType: "movie" })),
    ...(mediaData[1].results || []).map((item) => ({ ...item, mediaType: "tv" })),
  ];
}

const QUICK_FILTERS = [
  { label: { en: "Comedy", ar: "كوميدي" }, query: { en: "Comedy movies", ar: "أفلام كوميدية" } },
  { label: { en: "Action", ar: "أكشن" }, query: { en: "Action movies", ar: "أفلام أكشن" } },
  { label: { en: "Sci-Fi", ar: "خيال علمي" }, query: { en: "Sci-Fi movies", ar: "أفلام خيال علمي" } },
  { label: { en: "Award Winning", ar: "جوائز" }, query: { en: "Oscar winning movies", ar: "أفلام حائزة على جوائز" } },
];

const ContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const ItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// --- Minimalist Card Component ---
// Text is BELOW the image for a cleaner, gallery look
const MediaCard = memo(({ item }) => {
  const navigate = useNavigate();
  const title = item.title || item.name || item.original_name || "No Title";
  const year = (item.release_date || item.first_air_date || "").substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "";
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAV1BMVEXv8fNod4f19vhkdISPmqVcbX52g5L29/iYoq3l6OuCj5vd4eRfcIHr7fDL0NVaa33Bx81ufIuwt7+7wch8iZeiq7TU2N2Ml6KVn6miqrTGy9G1u8PP1Nl1USWeAAADHUlEQVR4nO3c7XKiMBhAYUjEoAb8/qj1/q9zxXasBFFhE3njnOfXzuzW6emLS42JSQIAAAAAAAAAAAAAAAAAAAAAAAAAAAC4VEhDx1XMIh+FclgPXXdWbDIdjl1Ohg5UG5uGpJdDB5ZZ0MA0td/DPhfNNuwIz0McDVuoch26cGoopJDCVwtt5pW8Qrub+DSz4gqzmdf/1QuJhV4fmMK3obA3Ct+Gwt5iKFRGXdZw+j2w/EKVrPdjnY4PZb9vUHyhWWhb/Y3W2XjXZ4zSC1X+t7ihs3WPROGF6lBb25gfuyfKLlQLZ3nKdl8SlF2YuK+Ke6wmiS5Ui8b6W9Z5iKILzaixsmEXXYcoulAt3cDUbj+qMGkWdn8iRld4+KhCtWk+D5tXqUomj35nFV1ovpqFpROjZvv5PMuL1gcWXZjs5o2r1P2y8ue31rR1gU52oZk6Q7Sreogqf38GWrclyi5MZvVbvh47X/T3pmPrFIUXquPtdap1/Tea2ruqbVMUXniO0Ncx2s2k1uC8bdwyRemFiSryubVa2yz9dp+DzguP+4niC6vG4yr/Wp3Uk8CWCzWCwmoVyhj3W7+7s+HeFKMovPfPy8atsmWKkRa27k1pTjHOwpYJ3p1ilIUPdxe5U4yx8Mn2KWeKERY+3R9Wn2J8hS9sgKslRlf40g6/2ws1tsIXtzDeTDGywge3ibYpxlXYYRPqdYpRFb48wdspxlTYcRvx7xQjKuy8T1qn1SvmeAp7bAS/TDGawl473aspxlLYcyv/OTGJo7D3WYXzhRpFYafbhJt4/ZPgQj+nTQQX/scE4yj0dV5IbKG3A1FSC/2d+BJa6PFIm8xCn2f2RBZ6PZQosdDTbUJuoSq9HrqUV+h3ggILvR8Mllbo/+SzsMIAR7tlFYY4uy6qMMjhfEmF5hTi0wcEFU5Ofm8T4grtOsypbjmFaaCPjxBUGAiFFFL4jNkGL9wPPEP3EJd37g7q9ycuww5R22H7zmapDflZX7rXCVS/itV0HMp0VQwfeDm0HUpjBy4AAAAAAAAAAAAAAAAAAAAAAAAAAACAz/APOCY/FtgxKw4AAAAASUVORK5CYII=";

  return (
    <motion.div
      layout
      variants={ItemVariants}
      className="group cursor-pointer flex flex-col gap-2"
      onClick={() => navigate(`/${item.mediaType === "tv" ? "series" : "movies"}/${item.id}`)}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 shadow-sm transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-xl ring-1 ring-white/10">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
            <Play className="fill-white text-white w-5 h-5 ml-1" />
          </div>
        </div>
        {/* Rating Badge (Top Right) */}
        {rating && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
            <Star size={8} className="fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
        )}
      </div>

      {/* Metadata (Below Image) */}
      <div className="px-1">
        <h3 className="text-gray-900 dark:text-gray-100 font-medium text-sm leading-tight line-clamp-1 group-hover:text-blue-500 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{year}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {item.mediaType === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
MediaCard.displayName = "MediaCard";

const Discover = () => {
  const { lang } = useTheme();
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tmdbResults, setTmdbResults] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cachedAiResults")); } catch { return null; }
  });
  const [currentCategory, setCurrentCategory] = useState("movie");

  const processedResults = useMemo(() => getMediaDataFiltered(tmdbResults), [tmdbResults]);

  useEffect(() => {
    if (tmdbResults) localStorage.setItem("cachedAiResults", JSON.stringify(tmdbResults));
  }, [tmdbResults]);

  const performSearch = useCallback((promptText) => {
    const trimmed = promptText.trim();
    if (!trimmed || trimmed.length < 3) return;

    setLoading(true);
    setFeedback("");
    setTmdbResults(null);

    const eventSource = new EventSource(`${API_BASE_URL}airecommend?prompt=${encodeURIComponent(trimmed)}`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message) setFeedback(data.message);
        if (data?.value && data.end === true) {
          setTmdbResults(data.value);
          setLoading(false);
          setFeedback("");
          eventSource.close();
        }
        if (data.success === false) {
          setLoading(false);
          eventSource.close();
        }
      } catch (err) { console.error(err); }
    };

    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
    };
  }, []);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      // Simplified background: Dark mode is nearly black, Light mode is pure white
      className="h-[calc(100vh-60px)] w-full overflow-y-auto bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white custom-scrollbar"
    >

      {/* --- Header & Search Area --- */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">

        {/* 1. Large Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            <input
              type="text"
              className="w-full bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 text-2xl md:text-3xl font-light py-4 pr-12 pl-2 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors placeholder-gray-300 dark:placeholder-zinc-700"
              placeholder={getTextByLang(lang, "بم تشعر؟", "What's the vibe today?")}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && performSearch(userPrompt)}
            />
            <button
              onClick={() => performSearch(userPrompt)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
            </button>
          </div>

          {/* AI Feedback Line */}
          <div className="h-6 mt-2 flex items-center gap-2">
            <AnimatePresence>
              {(loading || feedback) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-sm text-blue-500 font-medium"
                >
                  <Sparkles size={14} className={loading ? "animate-pulse" : ""} />
                  <span>{feedback || getTextByLang(lang, "جاري التفكير...", "Thinking...")}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. Controls Row (Categories + Chips) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100 dark:border-zinc-900 pb-4">

          {/* Minimal Text Tabs */}
          <div className="flex items-center gap-8">
            {['movie', 'tv'].map((type) => (
              <button
                key={type}
                onClick={() => setCurrentCategory(type)}
                className={`text-sm font-medium transition-colors relative pb-1 ${currentCategory === type
                  ? 'text-black dark:text-white'
                  : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
                  }`}
              >
                {getTextByLang(lang, type === 'movie' ? "أفلام" : "مسلسلات", type === 'movie' ? "Movies" : "TV Series")}
                {currentCategory === type && (
                  <motion.div layoutId="underline" className="absolute left-0 right-0 bottom-[-17px] h-[2px] bg-blue-500" />
                )}
              </button>
            ))}
          </div>

          {/* Subtle Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full hidden-scrollbar">
            {QUICK_FILTERS.map((f, i) => (
              <button
                key={i}
                onClick={() => {
                  const q = getTextByLang(lang, f.query.ar, f.query.en);
                  setUserPrompt(q);
                  performSearch(q);
                }}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all"
              >
                {getTextByLang(lang, f.label.ar, f.label.en)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Results Grid --- */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {processedResults ? (
          <motion.div
            variants={ContainerVariants}
            initial="hidden"
            animate="visible"
            key={currentCategory}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
          >
            <AnimatePresence mode="popLayout">
              {processedResults
                .filter((item) => item.mediaType === currentCategory)
                .map((item) => (
                  <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
                ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* --- Minimal Empty State --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center opacity-50"
          >
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
              {getTextByLang(lang, "ابدأ البحث", "Start exploring")}
            </p>
          </motion.div>
        )}

        {/* Empty Category Message */}
        {processedResults && processedResults.filter((item) => item.mediaType === currentCategory).length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-zinc-600 text-sm">
            {getTextByLang(lang, "لا توجد نتائج", "No results found")}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;