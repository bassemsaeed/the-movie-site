import {
  getFinalGeneratedKwordsAndGneres,
  getKeywordsFromPrompt,
} from "../services/gemini.service.js";
import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
async function aiRecommendationController(req, res) {
  const { prompt, l } = req.query;
  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.status(400).json({
      status: "Bad request",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }
  if (typeof prompt !== "string" || !isNaN(Number(prompt))) {
    return res.status(400).json({
      success: false,
      message:
        "Please provide a descriptive text prompt to get recommendations.",
    });
  }

  req.on("close", () => {
    console.log("Client closed connection.");
    res.end();
  });

  const sendEvent = (data) => {
    // The Server-Sent Event format thats compatiable with the client
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (req.rateLimitReached) {
    sendEvent({
      success: false,
      ...req.rateLimitReached,
    });
    return res.end();
  }

  try {
    sendEvent({
      success: true,
      start: true,
      message: "Analyzing your prompt to identify key themes...",
    });
    const keywords = await getKeywordsFromPrompt(prompt);
    sendEvent({
      success: true,
      message: "Searching the movie database for matching keywords...",
    });

    const tmdbKwordReuslts = await Promise.allSettled(
      keywords.map((kw) => {
        return axios.get(
          `https://api.themoviedb.org/3/search/keyword?query=${kw}`,
          {
            headers: {
              Authorization: `Bearer ${TMDB_API_KEY}`,
              Accept: "application/json",
            },
          },
        );
      }),
    );

    // getting the first 4 keywords results from tmdb for each of ai generated keywords pr less
    const fulfilledKeywords = tmdbKwordReuslts
      .filter((kwPromise) => kwPromise.value !== undefined)
      .map((kwPromise) => kwPromise.value.data);

    const extractedKeywords = fulfilledKeywords.filter(
      (data) => data.results !== undefined,
    );

    const finalKwords = extractedKeywords.flatMap((data) => {
      if (data.results.length > 4) {
        return data.results.slice(0, 4);
      }

      return data.results;
    });

    sendEvent({
      success: true,
      message: "getting your results...",
    });

    const genres_and_kwords = await getFinalGeneratedKwordsAndGneres(
      prompt,
      finalKwords,
    );

    const moviesReq = axios.get(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_null_first_air_dates=false&with_genres=${encodeURIComponent(genres_and_kwords.movie_query.with_genres)}&sort_by=popularity.des&with_keywords=${encodeURIComponent(genres_and_kwords.movie_query.with_keywords)}&language=${l}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          Accept: "application/json",
        },
      },
    );

    const seriesReq = axios.get(
      `https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&with_genres=${encodeURIComponent(genres_and_kwords.tv_query.with_genres)}&sort_by=popularity.des&with_keywords=${encodeURIComponent(genres_and_kwords.tv_query.with_keywords)}&language=${l}`,
      {
        headers: {
          Authorization: `Bearer ${TMDB_API_KEY}`,
          Accept: "application/json",
        },
      },
    );

    const [movies, series] = await Promise.allSettled([moviesReq, seriesReq]);

    sendEvent({
      success: true,
      end: true,
      message: "Here are your personalized recommendations!",
      value: [movies.value.data, series.value.data, genres_and_kwords],
    });
  } catch (error) {
    sendEvent({
      success: false,
      message: error.message,
    });
  } finally {
    res.end();
  }
}

export { aiRecommendationController };
