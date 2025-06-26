import { useRef, useState, useEffect } from "react";
import { getTextByLang } from "../utils";
import { Link, Outlet, useNavigate, useNavigation } from "react-router";
import useTheme from "../hooks/useTheme";
import { Menu, MoonStar, Search, Sun, X } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function HomePage() {
  let navigate = useNavigate();

  const { lang, theme, toggleTheme, setLanguage } = useTheme();
  const [showSeachPage, setShowSeachPage] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [loadingResultsError, setLoadingResultsError] = useState(null);
  const [retryCount, setRetryCount] = useState(0); // For retry mechanism
  const [searchQuery, setSearchQuery] = useState("");
  const isFirstLoading = useRef(true);

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const IMAGE_BASE_URL = "https://media.themoviedb.org/t/p/w220_and_h330_face/"; // Poster image base URL

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setLoadingResults(false);
      setLoadingResultsError(null);
      return;
    }

    const controller = new AbortController(); // For cleanup and aborting fetch
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      async function fetchSearchResultsData() {
        setLoadingResults(true);
        setLoadingResultsError(null); // Reset error before new attempt
        try {
          const response = await fetch(
            `${API_BASE_URL}search?q=${searchQuery}&l=${lang}`,
            { signal }, // Pass signal to fetch
          );

          if (!response.ok) {
            let errorBody = "Could not retrieve error details from server.";
            try {
              errorBody = await response.text();
            } catch (e) {
              // Ignore if reading body fails
            }
            throw new Error(
              `HTTP error! Status: ${response.status}. Server says: ${errorBody}`,
            );
          }

          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          if (error.name === "AbortError") {
            // Fetch was aborted, common during rapid input changes or unmount
          } else {
            setLoadingResultsError(error);
            setSearchResults(null); // Clear results on error
          }
        } finally {
          setLoadingResults(false);
        }
      }
      fetchSearchResultsData();
    }, 1000); // Debounce search

    return () => {
      clearTimeout(timeoutId);
      controller.abort(); // Abort fetch on cleanup
    };
  }, [searchQuery, lang, retryCount]);

  const getTitle = (item) =>
    item.title ||
    item.name ||
    (lang === "ar" ? "عنوان غير متوفر" : "Title not available");

  const getYear = (item) => {
    if (item.media_type === "movie" && item.release_date) {
      return `(${item.release_date.substring(0, 4)})`;
    }
    if (item.media_type === "tv" && item.first_air_date) {
      return `(${item.first_air_date.substring(0, 4)})`;
    }
    return "";
  };

  const placeholderImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAWlBMVEXv8fNod4f19vhkdIRcbX52g5KPmqX29/iYoq3l6OuCj5vd4eTr7fBfcIFaa33M0dbBx82SnKe7wchtfIt8iZejq7TU2N2Ik6CwuL/Gy9Gqsrqbpa/P1NmhqrNz0egRAAADBklEQVR4nO3c63KqMBRAYUiwwUvEete27/+ax1tVAqhwEtnprO+XM62Oyw2CGTFJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJe6Mb5vqL7jjsws/wgln/dddzBZZjocuxj2HaiWNg1JL/oO3GVBA9PUzvvdF80q7AgPQ/zot1DlOnThyFBIIYWvFtrMK3mFdj30aWzFFWZjr+/qE4mFXh+YwrehsDMK34bCzmIoVEad1nC6PbD8QpXMNwOdDvKi2xMUX2jm2h7/onU2WHcZo/RCld8WN3TWZR1CeKH6LK1tTGftE2UXqpmzPGXbLwnKLkzcT8X6s/UQRReqWWX9LWs9RNGF5qOysmFb74miC9XCDUzt6k8VJtXC9jsihW9Tu5Uuq/vhvlKokuGjc1bRhWZVLdw5MWq8mU6zfNL4wKILk/W0spW6dyvOZ61p4wKd7EIzcoZot+UQVVxeA62bEmUXJuPyIV8PnDsVtxXtpikKL1S7++1U6/IZzV1g8xSFFx4i9HWMdjksNZQCGxOlFyZq8jW1VmubpZV90PngUZ8ovvDYuNt//Wy/1ZPAhsQICo+rUMa4T70msP7tJorCun8vKofKhilGWlg7wfopxlnYMMHaKUZZ2DjBuinGWPgwsDLFCAufBLqJ8RU+DXQ21OgKXwgsTzG2wpcCj1O8nsJGVvjgMNE0xbgKX5zgeYqXxKgKX57geYrnDTWmwhYTvJtiRIUtA3/fbuIpbB14mWI0hR0Cz1OMpbBT4CkxiaOwY+BpQ42isNVhwk283hJc2HmC5Va5hf8xwTgK/UxQcKGvQLGF3gKlFvoLFFroMVBmoc9AkYWeDhNyC1Xh9aJLeYV+Jyiw0Os+KLHQe6C0Qv+BwgoDBMoqDBEoqtCECJRUOPz2e5gQV2jnYa7qllOYBvr5CEGFgVBIIYXPmJ/ghZueZ+hexOWd+w3q9ycuwg5R2377DsapDflbX7rTFah+TbajQSij/aT/wNNF26FUvoELAAAAAAAAAAAAAAAAAAAAAAAAAAAA4G/4B9L3P1vg3y4/AAAAAElFTkSuQmCC`;

  return (
    <div className="h-screen bg-white w-screen relative transition-all duration-150 dark:bg-neutral-900 overflow-y-hidden overflow-x-hidden">
      {/** LOADING INDICATOR */}
      {isNavigating ? (
        <div dir={"ltr"} className="w-screen h-[3px]  fixed top-0 z-[53]">
          <div className="w-[150px] bg-rose-500 animate-slide h-full"></div>
        </div>
      ) : null}
      {/** NAV BAR */}
      <motion.div
        initial={{ opacity: isFirstLoading.current ? 1 : 0 }} // Avoid initial animation flicker on first load if not desired
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-w-fit h-[60px] lg:gap-2 flex py-2 px-2 sm:px-5 md:px-6 lg:px-7 sticky top-0 z-40 justify-center items-center bg-white dark:bg-neutral-900 shadow-sm"
      >
        {/** MENU ICON FOR SMALLER SCREENS  */}
        <div className="flex w-fit h-full justify-center items-center ">
          <Menu
            size={24}
            className=" cursor-pointer text-black dark:text-white"
            // color={theme === "light" ? "black" : "white"} // Handled by className now
            onClick={() => setShowNavMenu(!showNavMenu)}
          />
        </div>

        {/* Main Search Input (hidden on small screens initially) */}
        <div className=" hidden sm:flex lg:flex md:flex grow h-full relative items-center justify-center rounded-[8px] mx-2">
          <input
            type="text"
            onFocus={() => {
              setShowSeachPage(true);
            }}
            className="w-full h-full px-5 outline-none antialiased font-ar mt-1 dark:placeholder:text-gray-400 dark:text-white bg-gray-100 dark:bg-neutral-800 rounded-[8px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "ابحث عن أي فيلم, مسلسل أو شخصية"
                : "Search any movie, tv series or characters"
            }
          />
        </div>

        {/** SEARCH ICON FOR SMALLER SCREENS INSTEAD OF FULL SEARCH BAR */}
        <div
          className="lg:hidden md:hidden sm:hidden h-full w-[50px] flex justify-center items-center "
          style={{
            marginRight: lang === "ar" ? 0 : "auto",
            marginLeft: lang === "ar" ? "auto" : 0,
          }}
        >
          <Search
            size={24}
            className="cursor-pointer text-black dark:text-white"
            onClick={() => setShowSeachPage(!showSeachPage)}
          />
        </div>

        {/* Theme Toggle & Language Switcher */}
        <div
          className="flex w-fit text-black text-[16px] h-full 
        gap-2 items-center dark:text-white px-2 font-ar"
        >
          {theme === "dark" ? (
            <Sun
              size={20}
              className="cursor-pointer"
              onClick={() => {
                toggleTheme();
              }}
            />
          ) : (
            <MoonStar
              size={20}
              className="cursor-pointer"
              onClick={() => {
                toggleTheme();
              }}
            />
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <button
              className={`select-none ${
                lang === "en"
                  ? "cursor-pointer text-black dark:text-white font-semibold"
                  : "cursor-pointer text-neutral-400 dark:text-neutral-500"
              }`}
              onClick={() => {
                isFirstLoading.current = false;
                setLanguage("en");
              }}
            >
              EN
            </button>
            <div className="w-[2px] h-5 bg-black dark:bg-white"></div>
            <button
              className={`select-none ${
                lang === "ar"
                  ? "cursor-pointer text-black dark:text-white font-semibold"
                  : "cursor-pointer text-neutral-400 dark:text-neutral-500"
              }`}
              onClick={() => {
                isFirstLoading.current = false;
                setLanguage("ar");
              }}
            >
              AR
            </button>
          </div>
        </div>
      </motion.div>
      <Outlet /> {/* For child routes */}
      {/* Search Page Overlay */}
      {showSeachPage ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="z-30 w-full h-[calc(100vh-60px)] dark:bg-zinc-800 overflow-hidden absolute bg-zinc-300 top-[60px] flex flex-col"
        >
          <div className="w-full flex justify-end py-2 px-7 items-center">
            <X
              size={28}
              className="cursor-pointer text-black dark:text-white"
              onClick={() => setShowSeachPage(false)}
            />
          </div>

          {/* Search Input for small screens (when search page is open) */}
          <div className="w-11/12 self-center h-[55px] rounded-2xl lg:hidden md:hidden sm:hidden flex justify-center  items-center bg-white dark:bg-zinc-700 shadow">
            <input
              type="text"
              autoFocus
              className="w-full dark:text-white font-ar h-[55px] px-5 outline-none bg-transparent rounded-2xl"
              placeholder={getTextByLang(
                lang,
                "ابحث عن أي فيلم, مسلسل أو شخصية",
                "Search any movie, tv series or characters",
              )}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
          </div>

          {/** SEARCH RESULTS AREA */}
          <div
            className="w-full hidden-scrollbar flex-grow border-t border-gray-300 dark:border-gray-700 overflow-y-auto p-4 mt-3 " // Modified for scrollable grid
          >
            {loadingResults ? (
              <div className="flex justify-center items-center h-full">
                <div className="loading-spinner"></div>
              </div>
            ) : loadingResultsError ? (
              <div className="font-ar dark:text-red-400 text-red-500 h-full flex justify-center items-center flex-col text-center p-4">
                <h4 className="text-lg font-semibold">
                  {lang === "ar"
                    ? "لقد حدث خطأ اثناء جلب المعلومات"
                    : "An unexpected error occurred"}
                </h4>
                <p className="text-sm mt-1 mb-4 dark:text-red-300 text-red-400">
                  {loadingResultsError.message}
                </p>
                <button
                  className="text-black dark:text-white cursor-pointer border border-gray-400 dark:border-gray-600 h-12 rounded-md px-6 py-2 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                  onClick={() => setRetryCount((c) => c + 1)}
                >
                  {lang === "ar" ? "أعد المحاوله" : "Try Again"}
                </button>
              </div>
            ) : searchResults && searchResults.results ? ( // Results exist
              searchResults.results.length > 0 ? (
                <div className="flex flex-col gap-5 ">
                  {searchResults.results.filter(
                    (item) => item.media_type === "movie",
                  ).length > 0 ? (
                    <div className="flex flex-col gap-3 ">
                      <h1 className="font-ar dark:text-white">
                        {getTextByLang(lang, "أفلام", "Movies")}
                      </h1>
                      <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-5">
                        {searchResults.results
                          .filter((item) => item.media_type === "movie")
                          .map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:scale-101 transition-transform duration-200"
                            >
                              <img
                                src={
                                  item.poster_path
                                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                                    : item.profile_path
                                      ? `${IMAGE_BASE_URL}${item.profile_path}`
                                      : placeholderImage
                                }
                                alt={getTitle(item)}
                                className="w-full h-auto aspect-[2/3] object-cover cursor-pointer" // Fixed aspect ratio for poster
                                onClick={() =>
                                  navigate(
                                    `/movies/${item.id}${lang === "ar" ? "?l=ar" : ""}`,
                                  )
                                }
                              />
                              <div className="p-3 flex flex-col flex-grow">
                                <h3 className="text-md font-ar font-semibold text-black dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                                  {getTitle(item)}
                                </h3>
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 uppercase mt-0.5">
                                  {getTextByLang(
                                    lang,
                                    item.media_type === "movie"
                                      ? "فيلم"
                                      : item.media_type === "tv"
                                        ? "مسلسل"
                                        : "شخص",
                                    item.media_type,
                                  )}{" "}
                                  {getYear(item)}
                                </p>
                                {item.overview && (
                                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">
                                    {" "}
                                    {/* Requires @tailwindcss/line-clamp plugin */}
                                    {item.overview}
                                  </p>
                                )}
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 mt-auto pt-2">
                                  {lang === "ar" ? "تقييم: " : "Rating: "}{" "}
                                  {item.vote_average
                                    ? item.vote_average.toFixed(1)
                                    : "N/A"}{" "}
                                  ({item.vote_count}{" "}
                                  {lang === "ar" ? "صوت" : "votes"})
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ) : null}

                  {searchResults.results.filter(
                    (item) => item.media_type === "tv",
                  ).length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h1 className="font-ar dark:text-white">
                        {getTextByLang(lang, "مسلسلات", "TV series")}
                      </h1>
                      <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3  grid-cols-2  gap-5">
                        {searchResults.results
                          .filter((item) => item.media_type === "tv")
                          .map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:scale-101 transition-transform duration-200"
                            >
                              <img
                                src={
                                  item.poster_path
                                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                                    : item.profile_path
                                      ? `${IMAGE_BASE_URL}${item.profile_path}`
                                      : placeholderImage
                                }
                                alt={getTitle(item)}
                                className="w-full h-auto aspect-[2/3] object-cover cursor-pointer" // Fixed aspect ratio for poster
                                onClick={() =>
                                  navigate(
                                    `/series/${item.id}${lang === "ar" ? "?l=ar" : ""}`,
                                  )
                                }
                              />
                              <div className="p-3 flex flex-col flex-grow">
                                <h3 className="text-md font-ar font-semibold text-black dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                                  {getTitle(item)}
                                </h3>
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 uppercase mt-0.5">
                                  {getTextByLang(
                                    lang,
                                    item.media_type === "movie"
                                      ? "فيلم"
                                      : item.media_type === "tv"
                                        ? "مسلسل"
                                        : "شخص",
                                    item.media_type,
                                  )}{" "}
                                  {getYear(item)}
                                </p>
                                {item.overview && (
                                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">
                                    {" "}
                                    {/* Requires @tailwindcss/line-clamp plugin */}
                                    {item.overview}
                                  </p>
                                )}
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 mt-auto pt-2">
                                  {lang === "ar" ? "تقييم: " : "Rating: "}{" "}
                                  {item.vote_average
                                    ? item.vote_average.toFixed(1)
                                    : "N/A"}{" "}
                                  ({item.vote_count}{" "}
                                  {lang === "ar" ? "صوت" : "votes"})
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ) : null}

                  {searchResults.results.filter(
                    (item) => item.media_type === "person",
                  ).length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h1 className="font-ar dark:text-white">
                        {getTextByLang(lang, "أشخاص", "People")}
                      </h1>
                      <div className="grid lg:grid-cols-5  md:grid-cols-4 sm:grid-cols-3 grid-cols-2  gap-5">
                        {searchResults.results
                          .filter((item) => item.media_type === "person")
                          .map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:scale-101 transition-transform duration-200"
                            >
                              <img
                                src={
                                  item.poster_path
                                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                                    : item.profile_path
                                      ? `${IMAGE_BASE_URL}${item.profile_path}`
                                      : placeholderImage
                                }
                                alt={getTitle(item)}
                                className="w-full h-auto aspect-[2/3] object-cover cursor-pointer" // Fixed aspect ratio for poster
                              />
                              <div className="p-3 flex flex-col flex-grow">
                                <h3 className="text-md font-ar font-semibold text-black dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-500 transition-colors">
                                  {getTitle(item)}
                                </h3>
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 uppercase mt-0.5">
                                  {getTextByLang(
                                    lang,
                                    item.media_type === "movie"
                                      ? "فيلم"
                                      : item.media_type === "tv"
                                        ? "مسلسل"
                                        : "شخص",
                                    item.media_type,
                                  )}{" "}
                                  {getYear(item)}
                                </p>
                                {item.overview && (
                                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-2 line-clamp-3 flex-grow">
                                    {" "}
                                    {/* Requires @tailwindcss/line-clamp plugin */}
                                    {item.overview}
                                  </p>
                                )}
                                <p className="text-xs font-ar text-gray-500 dark:text-gray-400 mt-auto pt-2">
                                  {lang === "ar" ? "تقييم: " : "Rating: "}{" "}
                                  {item.vote_average
                                    ? item.vote_average.toFixed(1)
                                    : "N/A"}{" "}
                                  ({item.vote_count}{" "}
                                  {lang === "ar" ? "صوت" : "votes"})
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                // No results found for the query
                <div className="flex justify-center items-center h-full text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    {searchQuery.trim()
                      ? lang === "ar"
                        ? `لم يتم العثور على نتائج لـ "${searchQuery}"`
                        : `No results found for "${searchQuery}"`
                      : lang === "ar"
                        ? "ابدأ بالكتابة للبحث"
                        : "Start typing to search"}
                  </p>
                </div>
              )
            ) : (
              // Initial state or searchQuery is empty
              <div className="flex justify-center items-center h-full text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {lang === "ar"
                    ? "ابدأ بالكتابة للبحث عن الأفلام والمسلسلات والمزيد"
                    : "Start typing to search for movies, TV shows, and more."}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
      {/* Navigation Menu Overlay */}
      {showNavMenu ? (
        <motion.div
          initial={{ opacity: 0, x: lang === "ar" ? 100 : -100 }} // Slide from side based on lang
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: lang === "ar" ? 100 : -100 }}
          className="z-30 w-full sm:w-64 md:w-72 h-[calc(100vh-60px)] dark:bg-zinc-800 overflow-auto absolute bg-zinc-300 top-[60px] shadow-xl"
          style={lang === "ar" ? { right: 0 } : { left: 0 }}
        >
          <div className="w-full flex-col text-black font-ar dark:text-white divide-y divide-gray-300 dark:divide-gray-700">
            {[
              { to: "/", ar: "الرئيسية", en: "Home" },
              { to: "/discover", ar: "اكتشف", en: "Discover" },
              {
                to: "/watchlater",
                ar: "قائمة المشاهدة لاحقًا",
                en: "Watch Later",
              },
            ].map((link) => (
              <div
                key={link.to}
                className="h-fit p-3.5 px-7 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Link
                  onClick={() => {
                    setShowNavMenu(false);
                  }}
                  to={link.to}
                  className="select-none cursor-pointer block w-full"
                >
                  {lang === "ar" ? link.ar : link.en}
                </Link>
              </div>
            ))}
            <div className="h-fit p-3.5 px-7 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
              <div
                className="select-none cursor-pointer"
                onClick={() => {
                  setShowNavMenu(false);
                }}
              >
                {lang === "ar" ? "إغلاق" : "Close"}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default HomePage;
