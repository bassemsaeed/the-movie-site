import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import useTheme from "../hooks/useTheme";
import { Star } from "lucide-react";

const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAWlBMVEXv8fNod4f19vhkdIRcbX52g5KPmqX29/iYoq3l6OuCj5vd4eTr7fBfcIFaa33M0dbBx82SnKe7wchtfIt8iZejq7TU2N2Ik6CwuL/Gy9Gqsrqbpa/P1NmhqrNz0egRAAADBklEQVR4nO3c63KqMBRAYUiwwUvEete27/+ax1tVAqhwEtnprO+XM62Oyw2CGTFJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJe6Mb5vqL7jjsws/wgln/dddzBZZjocuxj2HaiWNg1JL/oO3GVBA9PUzvvdF80q7AgPQ/zot1DlOnThyFBIIYWvFtrMK3mFdj30aWzFFWZjr+/qE4mFXh+YwrehsDMK34bCzmIoVEad1nC6PbD8QpXMNwOdDvKi2xMUX2jm2h7/onU2WHcZo/RCld8WN3TWZR1CeKH6LK1tTGftE2UXqpmzPGXbLwnKLkzcT8X6s/UQRReqWWX9LWs9RNGF5qOysmFb74miC9XCDUzt6k8VJtXC9jsihW9Tu5Uuq/vhvlKokuGjc1bRhWZVLdw5MWq8mU6zfNL4wKILk/W0spW6dyvOZ61p4wKd7EIzcoZot+UQVVxeA62bEmUXJuPyIV8PnDsVtxXtpikKL1S7++1U6/IZzV1g8xSFFx4i9HWMdjksNZQCGxOlFyZq8jW1VmubpZV90PngUZ8ovvDYuNt//Wy/1ZPAhsQICo+rUMa4T70msP7tJorCun8vKofKhilGWlg7wfopxlnYMMHaKUZZ2DjBuinGWPgwsDLFCAufBLqJ8RU+DXQ21OgKXwgsTzG2wpcCj1O8nsJGVvjgMNE0xbgKX5zgeYqXxKgKX57geYrnDTWmwhYTvJtiRIUtA3/fbuIpbB14mWI0hR0Cz1OMpbBT4CkxiaOwY+BpQ42isNVhwk283hJc2HmC5Va5hf8xwTgK/UxQcKGvQLGF3gKlFvoLFFroMVBmoc9AkYWeDhNyC1Xh9aJLeYV+Jyiw0Os+KLHQe6C0Qv+BwgoDBMoqDBEoqtCECJRUOPz2e5gQV2jnYa7qllOYBvr5CEGFgVBIIYXPmJ/ghZueZ+hexOWd+w3q9ycuwg5R2377DsapDflbX7rTFah+TbajQSij/aT/wNNF26FUvoELAAAAAAAAAAAAAAAAAAAAAAAAAAAA4G/4B9L3P1vg3y4/AAAAAElFTkSuQmCC";

const BASE_IMAGE_URL = "https://media.themoviedb.org/t/p/w227_and_h127_bestv2";
const formatRuntime = (minutes, lang) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return lang === "ar" ? `${mins}دقيقه` : `${mins}m`;
  return lang === "ar" ? `${hours} ساعه ${mins} دقيقه` : `${hours}h ${mins}m`;
};

const Episode = React.memo(
  ({ seriesId, seasonNum, episodeNum, retryCount }) => {
    const { lang } = useTheme();
    const [loadingEpisodeData, setLoadingEpisodeData] = useState(false);
    const [episodeData, setEpisodeData] = useState(null);
    const [errLoadingEpisodeData, setErrLoadingEpisodeData] = useState(null);

    const getEpisodeData = useCallback(async () => {
      try {
        setLoadingEpisodeData(true);
        const { data } = await axios.get(
          `http://localhost:3000/episode/${seriesId}/${seasonNum}/${episodeNum}${lang === "ar" ? "?l=ar" : ""}`
        );

        if (data.status === "error") {
          setErrLoadingEpisodeData(data);
          setLoadingEpisodeData(false);
          return;
        }
        setEpisodeData(data);
      } catch (error) {
        setErrLoadingEpisodeData(error);
      } finally {
        setLoadingEpisodeData(false);
      }
    }, [seriesId, seasonNum, episodeNum, lang, retryCount]);

    useEffect(() => {
      setErrLoadingEpisodeData(null);
    }, [seriesId, seasonNum, episodeNum, lang, retryCount]);
    useEffect(() => {
      getEpisodeData();
    }, [getEpisodeData]);

    return (
      <div className="w-full  h-[200px] dark:text-white flex lg:flex-row md:flex-row sm:flex-col flex-col gap-5">
        {/** EPISODE COVER */}
        <div className="min-w-[320px] h-full dark:bg-white/40 bg-black/40 rounded-2xl flex justify-center items-center">
          {loadingEpisodeData ? (
            <div className="w-10 h-10  border-gray border-2 dark:border-white border-t-rose-500 dark:border-t-rose-500 animate-spin rounded-full"></div>
          ) : errLoadingEpisodeData ? (
            <div className="dark:text-white font-ar">
              {lang === "ar"
                ? "لقد حدث خطأ"
                : "An unexpected error has happend"}
            </div>
          ) : (
            <img
              src={
                episodeData?.still_path
                  ? BASE_IMAGE_URL + episodeData.still_path
                  : PLACEHOLDER_IMAGE
              }
              className="w-full h-full object-cover rounded-2xl"
            />
          )}
        </div>

        {/** EPISODE DATA */}
        <div className=" px-2 flex flex-col justify-between gap-3">
          <div>
            {" "}
            <h2 className="font-ar text-2xl text-black dark:text-white">
              {episodeData?.name}
            </h2>
            <p className="line-clamp-5 dark:text-gray-300 text-black ">
              {episodeData?.overview
                ? episodeData.overview
                : lang === "ar"
                  ? "لا يوجد وصف للحلقه باللغة العربية."
                  : "No overview available in english."}
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <div className="px-3 py-1 bg-sky-500/35 w-fit h-fit rounded-2xl text-sky-700 dark:text-gray-50">
              {formatRuntime(episodeData?.runtime, lang)}
            </div>

            <div className="px-3 py-1 flex flex-row items-center justify-center gap-2 bg-amber-300/20 w-fit h-fit rounded-2xl dark:text-gray-50">
              <p>{episodeData?.vote_average}</p> <Star color="gold" size={20} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Episode;
