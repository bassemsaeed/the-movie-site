import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, PlayCircle, Loader2, X, Filter, Sparkles, Film, Tv } from "lucide-react";
import { useNavigate } from "react-router";
import { getTextByLang } from "../utils";
import useTheme from "../hooks/useTheme";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Helper Functions ---
function getMediaDataFiltered(mediaData) {
  if (!mediaData || !Array.isArray(mediaData) || mediaData.length < 2) return null;
  return [
    ...(mediaData[0].results || []).map((item) => ({ ...item, mediaType: "movie" })),
    ...(mediaData[1].results || []).map((item) => ({ ...item, mediaType: "tv" })),
  ];
}

const QUICK_FILTERS = [
  { label: { en: "Funny", ar: "كوميدي" }, query: { en: "Comedy movies", ar: "أفلام كوميدية" } },
  { label: { en: "Action", ar: "أكشن" }, query: { en: "Action movies", ar: "أفلام أكشن" } },
  { label: { en: "Drama", ar: "دراما" }, query: { en: "Drama movies", ar: "أفلام دراما" } },
  { label: { en: "Sci-Fi", ar: "خيال علمي" }, query: { en: "Sci-Fi movies", ar: "أفلام خيال علمي" } },
  { label: { en: "Classic", ar: "كلاسيكيات" }, query: { en: "Classic movies", ar: "أفلام كلاسيكية" } },
];

const ContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const ItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// --- Components ---
const MediaCard = memo(({ item }) => {
  const navigate = useNavigate();
  const title = item.title || item.name || item.original_name || "No Title.";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAV1BMVEXv8fNod4f19vhkdISPmqVcbX52g5L29/iYoq3l6OuCj5vd4eRfcIHr7fDL0NVaa33Bx81ufIuwt7+7wch8iZeiq7TU2N2Ml6KVn6miqrTGy9G1u8PP1Nl1USWeAAADHUlEQVR4nO3c7XKiMBhAYUjEoAb8/qj1/q9zxXasBFFhE3njnOfXzuzW6emLS42JSQIAAAAAAAAAAAAAAAAAAAAAAAAAAAC4VEhDx1XMIh+FclgPXXdWbDIdjl1Ohg5UG5uGpJdDB5ZZ0MA0td/DPhfNNuwIz0McDVuoch26cGoopJDCVwtt5pW8Qrub+DSz4gqzmdf/1QuJhV4fmMK3obA3Ct+Gwt5iKFRGXdZw+j2w/EKVrPdjnY4PZb9vUHyhWWhb/Y3W2XjXZ4zSC1X+t7ihs3WPROGF6lBb25gfuyfKLlQLZ3nKdl8SlF2YuK+Ke6wmiS5Ui8b6W9Z5iKILzaixsmEXXYcoulAt3cDUbj+qMGkWdn8iRld4+KhCtWk+D5tXqUomj35nFV1ovpqFpROjZvv5PMuL1gcWXZjs5o2r1P2y8ue31rR1gU52oZk6Q7Sreogqf38GWrclyi5MZvVbvh47X/T3pmPrFIUXquPtdap1/Tea2ruqbVMUXniO0Ncx2s2k1uC8bdwyRemFiSryubVa2yz9dp+DzguP+4niC6vG4yr/Wp3Uk8CWCzWCwmoVyhj3W7+7s+HeFKMovPfPy8atsmWKkRa27k1pTjHOwpYJ3p1ilIUPdxe5U4yx8Mn2KWeKERY+3R9Wn2J8hS9sgKslRlf40g6/2ws1tsIXtzDeTDGywge3ibYpxlXYYRPqdYpRFb48wdspxlTYcRvx7xQjKuy8T1qn1SvmeAp7bAS/TDGawl473aspxlLYcyv/OTGJo7D3WYXzhRpFYafbhJt4/ZPgQj+nTQQX/scE4yj0dV5IbKG3A1FSC/2d+BJa6PFIm8xCn2f2RBZ6PZQosdDTbUJuoSq9HrqUV+h3ggILvR8Mllbo/+SzsMIAR7tlFYY4uy6qMMjhfEmF5hTi0wcEFU5Ofm8T4grtOsypbjmFaaCPjxBUGAiFFFL4jNkGL9wPPEP3EJd37g7q9ycuww5R22H7zmapDflZX7rXCVS/itV0HMp0VQwfeDm0HUpjBy4AAAAAAAAAAAAAAAAAAAAAAAAAAACAz/APOCY/FtgxKw4AAAAASUVORK5CYII=";

  return (
    <motion.div
      layout
      variants={ItemVariants}
      className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5"
      onClick={() => navigate(`/${item.mediaType === "tv" ? "series" : "movies"}/${item.id}`)}
    >
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className="bg-white/20 backdrop-blur-md p-3 rounded-full"
        >
          <PlayCircle className="text-white w-8 h-8" strokeWidth={1.5} />
        </motion.div>
      </div>
      {rating !== "N/A" && parseFloat(rating) > 0 && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
          <Star size={11} className="text-yellow-400" fill="currentColor" />
          {rating}
        </div>
      )}
    </motion.div>
  );
});
MediaCard.displayName = "MediaCard";

const Discover = () => {
  const { lang } = useTheme();
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorFragment, setErrorFragment] = useState(null);
  const [feedback, setFeedback] = useState("");

  // Initialize from cache
  const [tmdbResults, setTmdbResults] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedAiResults");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [currentCategory, setCurrentCategory] = useState("movie");

  // Filter data
  const processedResults = useMemo(
    () => getMediaDataFiltered(tmdbResults),
    [tmdbResults]
  );

  // Cache data
  useEffect(() => {
    if (tmdbResults) {
      localStorage.setItem("cachedAiResults", JSON.stringify(tmdbResults));
    }
  }, [tmdbResults]);

  // Search Logic
  const performSearch = useCallback((promptText) => {
    const trimmed = promptText.trim();
    if (!trimmed || trimmed.length < 3) return;

    setLoading(true);
    setErrorFragment(null);
    setFeedback("");

    const eventSource = new EventSource(
      `${API_BASE_URL}airecommend?prompt=${encodeURIComponent(trimmed)}`
    );

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.message) {
          setFeedback(data.message);
        }

        if (data?.value && data.end === true) {
          setTmdbResults(data.value);
          setLoading(false);
          setFeedback("");
          eventSource.close();
        }
        if (data.success === false) {
          setErrorFragment("Error");
          setLoading(false);
          setFeedback("");
          eventSource.close();
        }
      } catch (err) { console.error(err); }
    };

    eventSource.onerror = () => {
      setLoading(false);
      setErrorFragment("Connection Error");
      setFeedback("");
      eventSource.close();
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && userPrompt) performSearch(userPrompt);
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      // Updated: z-0 to avoid conflicts, main-content bg color
      className="h-[calc(100vh-60px)] w-full overflow-y-auto bg-gray-50/50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 flex flex-col custom-scrollbar relative"
    >
      {/* Sticky Header */}
      {/* Updated: z-30 to stay below main navbar (usually z-40/50) */}
      {/* Updated: Light mode bg to be simpler, removed border-b in light mode if 'ugly' */}
      <div className="sticky top-0 z-30 bg-gray-50/95 dark:bg-neutral-900/80 backdrop-blur-md transition-all duration-300 dark:shadow-none dark:border-b dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4">

            {/* Search Row - Responsive Stacking */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-grow group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300">
                  <Search className={`h-5 w-5 ${loading ? 'text-blue-500 animate-pulse' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  placeholder={getTextByLang(lang, "اكتشف فيلمك التالي...", "Discover your next favorite...")}
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {loading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
                {!loading && userPrompt && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setUserPrompt('')}>
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  </div>
                )}


              </div>

              {/* Category Pills - Responsive Sizing */}
              <div className="flex-shrink-0 flex bg-gray-200/50 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200/50 dark:border-zinc-800 overflow-x-auto hidden-scrollbar">
                {['movie', 'tv'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCurrentCategory(type)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${currentCategory === type
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                  >
                    {type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                    <span className="inline">
                      {getTextByLang(lang, type === 'movie' ? "أفلام" : "مسلسلات", type === 'movie' ? "Movies" : "TV")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Message (Layout Block) */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-center gap-2 py-1 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg border border-blue-100/50 dark:border-blue-800/30">
                    <Loader2 size={12} className="animate-spin" />
                    <span>{feedback}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Filters Row */}
            <div className="flex items-center gap-2 pb-1 overflow-x-auto hidden-scrollbar">
              <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} />
                {getTextByLang(lang, "مقترحات:", "Ideas:")}
              </div>
              {QUICK_FILTERS.map((f, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const q = getTextByLang(lang, f.query.ar, f.query.en);
                    setUserPrompt(q);
                    performSearch(q);
                  }}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 shadow-sm"
                >
                  {getTextByLang(lang, f.label.ar, f.label.en)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {processedResults ? (
          <motion.div
            variants={ContainerVariants}
            initial="hidden"
            animate="visible"
            key={currentCategory} // Triggers re-animation on tab switch
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            <AnimatePresence>
              {processedResults
                .filter((item) => item.mediaType === currentCategory)
                .map((item) => (
                  <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
                ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center opacity-80"
          >
            <div className="bg-gray-200 dark:bg-zinc-900 p-6 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full"></div>
              <Search className="w-10 h-10 text-gray-400 dark:text-zinc-600 relative z-10" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {getTextByLang(lang, "جاهز للاكتشاف؟", "Ready to explore?")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {getTextByLang(lang, "ابحث عن عنوان، نوع، أو حتى صف شعورك للعثور على توصيات مخصصة.", "Search for a title, genre, or even describe your mood to get personalized recommendations.")}
            </p>
          </motion.div>
        )}

        {/* No Results found within existing set */}
        {processedResults && processedResults.filter((item) => item.mediaType === currentCategory).length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-lg text-gray-500 dark:text-zinc-500 font-medium">
              {getTextByLang(lang, "لا توجد نتائج في هذه الفئة", "No results found in this category")}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Discover;
