import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Smile,
  Zap,
  Cloudy,
  BrainCircuit,
  Film,
  Star,
  WandSparkles,
  Frown,
  Loader2,
} from "lucide-react";
import { getTextByLang } from "../utils";
import useTheme from "../hooks/useTheme";
import { useNavigate } from "react-router";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function getMediaDataFiltered(mediaData) {
  const filteredData = mediaData
    ? [
        ...(mediaData[0].results || []).map((item) => ({
          ...item,
          mediaType: "movie",
        })),
        ...(mediaData[1].results || []).map((item) => ({
          ...item,
          mediaType: "tv",
        })),
      ]
    : null;

  return filteredData;
}

const MediaCard = ({ item }) => {
  const navigate = useNavigate();
  const title = item.title || item.name || item.original_name || "No Title.";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAV1BMVEXv8fNod4f19vhkdISPmqVcbX52g5L29/iYoq3l6OuCj5vd4eRfcIHr7fDL0NVaa33Bx81ufIuwt7+7wch8iZeiq7TU2N2Ml6KVn6miqrTGy9G1u8PP1Nl1USWeAAADHUlEQVR4nO3c7XKiMBhAYUjEoAb8/qj1/q9zxXasBFFhE3njnOfXzuzW6emLS42JSQIAAAAAAAAAAAAAAAAAAAAAAAAAAAC4VEhDx1XMIh+FclgPXXdWbDIdjl1Ohg5UG5uGpJdDB5ZZ0MA0td/DPhfNNuwIz0McDVuoch26cGoopJDCVwtt5pW8Qrub+DSz4gqzmdf/1QuJhV4fmMK3obA3Ct+Gwt5iKFRGXdZw+j2w/EKVrPdjnY4PZb9vUHyhWWhb/Y3W2XjXZ4zSC1X+t7ihs3WPROGF6lBb25gfuyfKLlQLZ3nKdl8SlF2YuK+Ke6wmiS5Ui8b6W9Z5iKILzaixsmEXXYcoulAt3cDUbj+qMGkWdn8iRld4+KhCtWk+D5tXqUomj35nFV1ovpqFpROjZvv5PMuL1gcWXZjs5o2r1P2y8ue31rR1gU52oZk6Q7Sreogqf38GWrclyi5MZvVbvh47X/T3pmPrFIUXquPtdap1/Tea2ruqbVMUXniO0Ncx2s2k1uC8bdwyRemFiSryubVa2yz9dp+DzguP+4niC6vG4yr/Wp3Uk8CWCzWCwmoVyhj3W7+7s+HeFKMovPfPy8atsmWKkRa27k1pTjHOwpYJ3p1ilIUPdxe5U4yx8Mn2KWeKERY+3R9Wn2J8hS9sgKslRlf40g6/2ws1tsIXtzDeTDGywge3ibYpxlXYYRPqdYpRFb48wdspxlTYcRvx7xQjKuy8T1qn1SvmeAp7bAS/TDGawl473aspxlLYcyv/OTGJo7D3WYXzhRpFYafbhJt4/ZPgQj+nTQQX/scE4yj0dV5IbKG3A1FSC/2d+BJa6PFIm8xCn2f2RBZ6PZQosdDTbUJuoSq9HrqUV+h3ggILvR8Mllbo/+SzsMIAR7tlFYY4uy6qMMjhfEmF5hTi0wcEFU5Ofm8T4grtOsypbjmFaaCPjxBUGAiFFFL4jNkGL9wPPEP3EJd37g7q9ycuww5R22H7zmapDflZX7rXCVS/itV0HMp0VQwfeDm0HUpjBy4AAAAAAAAAAAAAAAAAAAAAAAAAAACAz/APOCY/FtgxKw4AAAAASUVORK5CYII=";

  return (
    <motion.div
      className="relative aspect-[2/3] bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      layout
      onClick={() => {
        navigate(
          `/${item.mediaType === "tv" ? "series" : "movies"}/${item.id}`,
        );
      }}
    >
      <img
        src={posterUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {rating !== "N/A" && rating > 0 && (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={12} className="text-yellow-400" fill="currentColor" />
          {rating}
        </div>
      )}

      <div className="absolute bottom-0 left-0 p-4 text-white w-full">
        <h3 className="font-bold text-lg leading-tight drop-shadow-md">
          {title}
        </h3>
        <p className="text-sm opacity-80 drop-shadow-md">
          {item.mediaType === "movie" ? "Movie" : "TV Show"}
        </p>
      </div>
    </motion.div>
  );
};

const TabControls = memo(
  ({
    currentChosenCategory,
    setCurrentChosenCategory,
    moviesCount,
    seriesCount,
    title,
    lang,
  }) => {
    const TabButton = ({ type, children, isDisabled }) => (
      <button
        disabled={isDisabled}
        className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 relative disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 ${
          currentChosenCategory === type
            ? "text-white"
            : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
        }`}
        onClick={() => {
          setCurrentChosenCategory(type);
          localStorage.setItem("category", type);
        }}
      >
        {currentChosenCategory === type && (
          <motion.div
            layoutId="active-result-pill"
            className="absolute inset-0 bg-blue-600 rounded-full"
            style={{ borderRadius: 9999 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </button>
    );

    return (
      <div className="sticky top-0 z-20 bg-gray-100/80 dark:bg-zinc-900/80 backdrop-blur-md py-4 mb-6">
        <div className="flex justify-center">
          <div className="bg-gray-200 dark:bg-zinc-800 p-1 rounded-full flex items-center gap-2">
            <TabButton type="movie" isDisabled={moviesCount === 0}>
              {getTextByLang(
                lang,
                `أفلام (${moviesCount})`,
                `Movies (${moviesCount})`,
              )}
            </TabButton>
            <TabButton type="tv" isDisabled={seriesCount === 0}>
              {getTextByLang(
                lang,
                `مسلسلات (${seriesCount})`,
                `Series (${seriesCount})`,
              )}
            </TabButton>
          </div>
        </div>
        <div className="flex items-center justify-center pt-4">
          <h2 className="font-bold dark:text-white text-4xl text-center">
            {title}
          </h2>
        </div>
      </div>
    );
  },
);

const ResultsDisplay = ({
  results,
  lang,
  currentChosenCategory,
  setCurrentChosenCategory,
  title,
}) => {
  const movies = results.filter((item) => item.mediaType === "movie");
  const series = results.filter((item) => item.mediaType === "tv");

  const activeResults = currentChosenCategory === "movie" ? movies : series;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
    exit: { opacity: 0 },
  };

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <TabControls
        currentChosenCategory={currentChosenCategory}
        setCurrentChosenCategory={setCurrentChosenCategory}
        moviesCount={movies.length}
        seriesCount={series.length}
        title={title}
        lang={lang}
      />

      <motion.div
        key={currentChosenCategory}
        className="grid flex-grow grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {activeResults.map((item) => (
          <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
        ))}
      </motion.div>

      {results.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-zinc-500 p-4 mt-16">
          <Frown size={48} className="mb-4 text-zinc-400" />
          <h3 className="text-xl font-semibold">
            {getTextByLang(lang, "لم نجد أي نتائج", "No Results Found")}
          </h3>
          <p className="max-w-sm">
            {getTextByLang(
              lang,
              "لم يتمكن الذكاء الاصطناعي من العثور على أي تطابق. حاول أن تكون أكثر تحديدًا أو عمومية!",
              "AI couldn't find any matches. Try being a little more specific or general!",
            )}
          </p>
        </div>
      )}
    </div>
  );
};

const suggestions = [
  {
    icon: Smile,
    text: { en: "I want to laugh out loud", ar: "أريد أن أضحك بصوت عالٍ" },
  },
  {
    icon: Zap,
    text: { en: "Show me something thrilling", ar: "أرني شيئًا مشوّقًا" },
  },
  { icon: Cloudy, text: { en: "I'm in the mood to cry", ar: "أريد أن أبكي" } },
  {
    icon: BrainCircuit,
    text: { en: "A mind-bending plot twist", ar: "حبكة قصصية مُحيرة للعقل" },
  },
  {
    icon: Film,
    text: {
      en: "A nostalgic 90s classic",
      ar: "كلاسيكية من التسعينات تبعث على الحنين",
    },
  },
];

const DiscoverModal = ({ handleClose, setTmdbResults }) => {
  const { lang } = useTheme();
  const [userPrompt, setUserPrompt] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [errInPrompt, setErrInPrompt] = useState(null);
  const [loadingTmdbData, setLoadingTmdbData] = useState(false);
  const [currentFeedbackFromAiEndpoint, setCurrentFeedbackFromAiEndpoint] =
    useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    const trimmedPrompt = userPrompt.trim();

    if (!userPrompt) return;
    // This regex checks if the ENTIRE string is composed of ONLY:
    // - an optional + or - at the start
    // - digits (0-9)
    // - whitespace
    // This correctly identifies "+325", "123", and even "35 2 2" as "number-only" input.
    const isOnlyNumbersAndSigns = /^[+\-\d\s]+$/.test(trimmedPrompt);

    // This regex now checks if the prompt contains at least one letter FROM ANY LANGUAGE.
    const containsLetters = /\p{L}/u.test(trimmedPrompt);
    if (isOnlyNumbersAndSigns || trimmedPrompt.length < 3 || !containsLetters) {
      setErrInPrompt({
        en: "Please describe a mood, theme, or movie using words.",
        ar: "يرجى وصف مزاج أو فكرة أو فيلم باستخدام الكلمات.",
      });

      return;
    }
    setErrInPrompt(null);
    const eventSource = new EventSource(
      `${API_BASE_URL}airecommend?prompt=${userPrompt}`,
    );
    eventSource.onmessage = (e) => {
      const recieveData = JSON.parse(e.data);
      if (recieveData.success === false && recieveData.limitReached) {
        setErrInPrompt({
          ar: recieveData.messages.ar,
          en: recieveData.messages.en,
        });
        eventSource.close();
        return;
      }

      if (recieveData.start === true) {
        setLoadingTmdbData(true);
      }

      if (recieveData.success === false) {
        setErrInPrompt({
          ar: "لقد حدث خطأ.",
          en: "An unexpected error happend.",
        });
        setCurrentFeedbackFromAiEndpoint(null);
        eventSource.close();
        
      }
      if (recieveData.message && recieveData.success !== false) {
        setCurrentFeedbackFromAiEndpoint(recieveData.message);
        console.log(recieveData)
      }
      if (recieveData?.value && recieveData.end === true) {
        setTmdbResults(recieveData.value);
        handleClose();
        setLoadingTmdbData(false);
        eventSource.close();
      }
    };
    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      setCurrentFeedbackFromAiEndpoint(null);
      setErrInPrompt({
        en: "an error occured while getting the data",
        ar: "لقد حدث خطأ",
      });
      eventSource.close();
    };
    return () => eventSource.close();
  }, [userPrompt, retryCount, handleClose, setTmdbResults]);

  return (
    <motion.div
      onClick={handleClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-start pt-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {currentFeedbackFromAiEndpoint ? (
          <motion.div
            key={currentFeedbackFromAiEndpoint}
            className="absolute top-10 sm:top-20 xs:top-32 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl font-semibold text-zinc-800 dark:text-zinc-200 p-2 px-4 rounded-lg shadow-lg h-fit text-center border border-white/20 dark:border-zinc-700"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {currentFeedbackFromAiEndpoint}
          </motion.div>
        ) : errInPrompt ? (
          <motion.div
            key={currentFeedbackFromAiEndpoint}
            className="absolute top-10 bg-red-500/80  backdrop-blur-xl font-semibold  text-zinc-200 p-2 px-4 rounded-lg shadow-lg border border-white/20 dark:border-zinc-700"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {getTextByLang(lang, errInPrompt.ar, errInPrompt.en)}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative mt-10 sm:mt-20 xs:mt-32 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-700"
        initial={{ scale: 0.95, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-zinc-700">
          {loadingTmdbData ? (
            <Loader2 className="text-gray-400 dark:text-zinc-500 flex-shrink-0 animate-spin" />
          ) : (
            <Search className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
          )}
          <input
            type="text"
            disabled={loadingTmdbData} // 3. Disable input while loading
            onKeyDown={(e) => {
              if (loadingTmdbData || !e.target.value) return;

              if (e.key.toLowerCase() === "enter") {
                setUserPrompt(e.target.value);
                setRetryCount(retryCount + 1);
              }
            }}
            placeholder={getTextByLang(
              lang,
              "صف مزاجك، أجواء، أو فيلم...",
              "Describe a mood, vibe, or movie...",
            )}
            className="w-full bg-transparent focus:outline-none text-lg text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 disabled:cursor-not-allowed"
            autoFocus
          />
        </div>

        <div className="relative p-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {loadingTmdbData && (
              <motion.div
                className="absolute inset-0 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase">
            {getTextByLang(
              lang,
              "أو جرب أحد هذه الاقتراحات",
              "Or try one of these",
            )}
          </p>
          <ul>
            {suggestions.map((item, index) => (
              <motion.li
                key={index}
                className={`flex items-center gap-4 p-3 rounded-lg text-gray-800 dark:text-white ${
                  loadingTmdbData
                    ? "text-gray-500 cursor-not-allowed"
                    : "cursor-pointer hover:bg-blue-500/10 dark:hover:bg-blue-500/20"
                }`}
                initial={
                  lang === "ar" ? { opacity: 0, x: 10 } : { opacity: 0, x: -10 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                onClick={() => {
                  if (loadingTmdbData) return;
                  setUserPrompt(item.text.en);
                  setRetryCount(retryCount + 1);
                }}
              >
                <item.icon
                  className="text-gray-500 dark:text-zinc-400"
                  size={20}
                />
                <span className="font-medium">
                  {getTextByLang(lang, item.text.ar, item.text.en)}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Discover = () => {
  const { lang } = useTheme();

  const [modalOpen, setModalOpen] = useState(false);

  const [currentChosenCategory, setCurrentChosenCategory] = useState(
    localStorage.getItem("category") || "tv",
  );
  const [tmdbResults, setTmdbResults] = useState(null);

  const open = () => {
    setTmdbResults(null);
    setModalOpen(true);
  };
  const close = () => setModalOpen(false);

  let processedResults = null;

  if (localStorage.getItem("cachedAiResults")) {
    if (!tmdbResults) {
      const cachedResults = JSON.parse(
        localStorage.getItem("cachedAiResults") || [],
      );
      processedResults = getMediaDataFiltered(cachedResults);
    } else {
      processedResults = getMediaDataFiltered(tmdbResults);
      localStorage.setItem("cachedAiResults", JSON.stringify(tmdbResults));
    }
  } else {
    processedResults = getMediaDataFiltered(tmdbResults);

    if (processedResults) {
      localStorage.setItem("cachedAiResults", JSON.stringify(tmdbResults));
    }
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="h-[calc(100vh-60px)] w-full flex flex-col items-center bg-gray-100 dark:bg-zinc-900 transition-colors duration-300"
    >
      <div className="w-full flex-grow overflow-y-auto custom-scrollbar px-4 md:px-6 pb-24">
        {processedResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsDisplay
              results={processedResults}
              lang={lang}
              title={
                tmdbResults?.[2]?.search_title ||
                JSON.parse(localStorage.getItem("cachedAiResults"))?.[2]
                  .search_title ||
                ""
              }
              currentChosenCategory={currentChosenCategory}
              setCurrentChosenCategory={setCurrentChosenCategory}
            />
          </motion.div>
        ) : (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center text-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <WandSparkles className="w-20 h-20 text-blue-500 mb-6" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {getTextByLang(
                lang,
                "ابحث عن فيلمك المثالي",
                "Find Your Perfect Watch",
              )}
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl">
              {getTextByLang(
                lang,
                "استخدم قوة الذكاء الاصطناعي لاكتشاف الأفلام والمسلسلات التي تناسب مزاجك. فقط صف ما تشعر به ودعنا نقوم بالباقي.",
                "Use AI to discover movies and shows that match your mood. Just describe what you feel like and let us do the rest.",
              )}
            </p>
          </motion.div>
        )}
      </div>

      <div className="w-full py-4 flex justify-center fixed bottom-0 bg-gradient-to-t from-gray-100 dark:from-zinc-900 to-transparent from-50% to-100% pointer-events-none">
        <motion.button
          onClick={open}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-blue-500/30 cursor-pointer flex items-center gap-2 pointer-events-auto"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Search size={20} />
          {processedResults
            ? getTextByLang(lang, "بحث جديد", "Search Again")
            : getTextByLang(lang, "ابدأ البحث", "Start Search")}
        </motion.button>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <DiscoverModal setTmdbResults={setTmdbResults} handleClose={close} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Discover;
