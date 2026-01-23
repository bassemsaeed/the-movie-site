import { useRef, useState, useEffect, useMemo } from "react";
import { getTextByLang } from "../utils";
import { Link, Outlet, useNavigate, useNavigation } from "react-router";
import useTheme from "../hooks/useTheme";
import {
  Menu, Moon, Search, Sun, X, Film, Tv, User, Globe,
  Star, Calendar, ArrowRight, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const IMAGE_BASE_URL = "https://media.themoviedb.org/t/p/w220_and_h330_face/";

function HomePage() {
  const navigate = useNavigate();
  const { lang, theme, toggleTheme, setLanguage } = useTheme();

  // State
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const isArabic = lang === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'movie', 'tv', 'person'

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const inputRef = useRef(null);

  // Focus input when search opens
  useEffect(() => {
    if (showSearchPage && inputRef.current) {
      // Small delay to ensure animation doesn't glitch focus
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showSearchPage]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowSearchPage(false);
        setShowNavMenu(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setLoadingResults(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoadingResults(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE_URL}search?q=${searchQuery}&l=${lang}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoadingResults(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, lang]);

  // Close menus on navigation
  useEffect(() => {
    setShowSearchPage(false);
    setShowNavMenu(false);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-x-hidden font-ar">

      {/* --- PROGRESS BAR --- */}
      {isNavigating && (
        <div dir="ltr" className="fixed top-0 left-0 w-full h-[3px] z-[100]">
          <div className="h-full bg-rose-500 animate-slide w-[30%] shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 w-full h-[64px] px-4 md:px-8 flex items-center justify-between
                   bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5"
      >
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNavMenu(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="font-black text-2xl tracking-tighter hover:text-rose-500 transition-colors">
            MOVI<span className="text-rose-500">X</span>
          </Link>
        </div>

        {/* Center: Fake Search Bar (Trigger) */}
        <div
          onClick={() => setShowSearchPage(true)}
          className="hidden md:flex flex-1 max-w-lg mx-8 h-10 items-center px-4 rounded-full 
                       bg-gray-100 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 
                       cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors border border-transparent hover:border-gray-300 dark:hover:border-neutral-600"
        >
          <Search className="w-4 h-4 mr-3" />
          <span className="text-sm">{getTextByLang(lang, "بحث سريع...", "Quick Search...")}</span>
          <span className="ml-auto text-xs opacity-60 border border-gray-300 dark:border-neutral-600 rounded px-1.5 py-0.5">/</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearchPage(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-yellow-500 dark:text-blue-400"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="h-6 w-[1px] bg-gray-300 dark:bg-neutral-800 mx-2" />

          <button
            onClick={() => setLanguage(lang === "en" ? "ar" : "en")}
            className="px-2 font-bold text-sm hover:text-rose-500 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </motion.nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-0">
        <Outlet />
      </main>

      {/* --- FULL SCREEN SEARCH OVERLAY --- */}
      <AnimatePresence>
        {showSearchPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl flex flex-col"
          >
            {/* Header: Input Area */}
            <div className="w-full max-w-5xl mx-auto pt-6 px-4 pb-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="relative flex items-center">
                <Search className="w-6 h-6 text-gray-400 absolute left-4 rtl:right-4 rtl:left-auto" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-gray-100 dark:bg-neutral-900 rounded-2xl py-4 pl-14 pr-14 text-xl outline-none dark:text-white placeholder:text-gray-400 shadow-inner"
                  placeholder={getTextByLang(lang, "ابحث عن الأفلام، المسلسلات، والأشخاص...", "Search movies, shows, people...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-14 rtl:left-14 rtl:right-auto p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={() => setShowSearchPage(false)}
                  className="absolute right-4 rtl:left-4 rtl:right-auto p-2 bg-gray-200 dark:bg-neutral-800 rounded-lg hover:bg-rose-500 hover:text-white transition-colors text-xs font-bold"
                >
                  ESC
                </button>
              </div>

              {/* Tabs Filter */}
              {searchResults?.results?.length > 0 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
                  <FilterTab label={getTextByLang(lang, "الكل", "All")} active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                  <FilterTab label={getTextByLang(lang, "أفلام", "Movies")} active={activeTab === 'movie'} onClick={() => setActiveTab('movie')} icon={<Film size={14} />} />
                  <FilterTab label={getTextByLang(lang, "مسلسلات", "TV Shows")} active={activeTab === 'tv'} onClick={() => setActiveTab('tv')} icon={<Tv size={14} />} />
                  <FilterTab label={getTextByLang(lang, "أشخاص", "People")} active={activeTab === 'person'} onClick={() => setActiveTab('person')} icon={<User size={14} />} />
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
              <div className="max-w-7xl mx-auto min-h-[50vh]">

                {loadingResults ? (
                  <SearchSkeleton />
                ) : searchResults?.results?.length > 0 ? (
                  <SearchResultsGrid
                    results={searchResults.results}
                    activeTab={activeTab}
                    lang={lang}
                    navigate={navigate}
                  />
                ) : searchQuery ? (
                  <EmptySearchState lang={lang} query={searchQuery} />
                ) : (
                  <InitialSearchState lang={lang} />
                )}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {showNavMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowNavMenu(false)}
            />
            <motion.div
              initial={{ x: lang === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: lang === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 z-50 w-72 bg-white dark:bg-neutral-900 shadow-2xl p-6 flex flex-col
                         ${lang === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} border-gray-100 dark:border-neutral-800`}
            >
              {/* Drawer Content Same as before... */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-black text-xl">
                  MOVI<span className="text-rose-500">X</span>
                </span>
                <button onClick={() => setShowNavMenu(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col space-y-2">
                {[
                  { path: "/", label_ar: "الرئيسية", label_en: "Home", icon: <Film size={18} /> },
                  { path: "/discover", label_ar: "اكتشف", label_en: "Discover", icon: <Globe size={18} /> },
                  { path: "/watchlater", label_ar: "قائمتي", label_en: "My List", icon: <Tv size={18} /> },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setShowNavMenu(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-neutral-800 hover:text-rose-500 transition-all font-medium"
                  >
                    {link.icon}
                    {lang === 'ar' ? link.label_ar : link.label_en}
                  </Link>
                ))}
              </div>

              {/* Footer / Extra Info */}
              <div className="mt-auto pt-6 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Globe size={16} />
                  <span>{isArabic ? "العربية" : "English"}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

const FilterTab = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
        ${active
        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
        : "bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700"
      }`}
  >
    {icon}
    {label}
  </button>
);

const SearchResultsGrid = ({ results, activeTab, lang, navigate }) => {
  // Filter results based on active tab
  const filtered = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(item => item.media_type === activeTab);
  }, [results, activeTab]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">{getTextByLang(lang, "لا توجد نتائج في هذه الفئة", "No results in this category")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-6">
      {filtered.map((item, idx) => (
        <ResultCard key={item.id} item={item} idx={idx} lang={lang} navigate={navigate} />
      ))}
    </div>
  );
};

const ResultCard = ({ item, idx, lang, navigate }) => {
  const isPerson = item.media_type === 'person';
  const title = item.title || item.name;
  const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      onClick={() => {
        if (isPerson) return;
        navigate(`/${item.media_type === 'movie' ? 'movies' : 'series'}/${item.id}${lang === "ar" ? "?l=ar" : ""}`);
      }}
      className="group relative cursor-pointer"
    >
      {/* Poster Container */}
      <div className={`relative overflow-hidden bg-neutral-800 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-rose-500/10 group-hover:-translate-y-1
                ${isPerson ? "rounded-full aspect-square" : "rounded-xl aspect-[2/3]"}
            `}>
        <img
          src={item.poster_path || item.profile_path ? `${IMAGE_BASE_URL}${item.poster_path || item.profile_path}` : "https://via.placeholder.com/300x450?text=No+Image"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Hover Overlay (Not for Person) */}
        {!isPerson && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <button className="bg-rose-600 text-white text-xs font-bold py-2 px-4 rounded-full mx-auto mb-2 transform scale-90 group-hover:scale-100 transition-transform">
              {getTextByLang(lang, "عرض", "View")}
            </button>
          </div>
        )}

        {/* Rating Badge */}
        {!isPerson && rating > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-bold text-white">{rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`mt-3 ${isPerson ? "text-center" : "text-start"}`}>
        <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 truncate group-hover:text-rose-500 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 justify-start">
          {!isPerson && <span>{year}</span>}
          <span className="uppercase border border-gray-200 dark:border-neutral-700 px-1 rounded text-[9px]">
            {item.media_type === 'tv' ? 'TV' : item.media_type}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Skeleton Loading UI
const SearchSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 animate-pulse">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i}>
        <div className="aspect-[2/3] bg-gray-200 dark:bg-neutral-800 rounded-xl mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

const InitialSearchState = ({ lang }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 dark:text-neutral-600">
    <div className="w-20 h-20 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 opacity-50" />
    </div>
    <p className="text-xl font-medium">{getTextByLang(lang, "ما الذي تبحث عنه؟", "What are you looking for?")}</p>
    <p className="text-sm mt-2 opacity-70">{getTextByLang(lang, "ابحث عن الأفلام، المسلسلات، والمزيد", "Search for movies, TV series, and more")}</p>
  </div>
);

const EmptySearchState = ({ lang, query }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
    <Film className="w-16 h-16 mb-4 stroke-1 opacity-50" />
    <p className="text-lg">
      {getTextByLang(lang, "لا توجد نتائج لـ", "No results found for")} <span className="text-rose-500 font-bold">"{query}"</span>
    </p>
  </div>
);

export default HomePage;