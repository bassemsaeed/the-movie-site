import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_API_URL = "https://api.themoviedb.org/3/";
async function fetchData(url) {
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${TMDB_API_KEY}`,
      Accept: "application/json",
    },
  });

  return data;
}

async function getTrending(key, lang) {
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL + `trending/${key}/week?language=${lang}`,
  );

  return data;
}

async function searchMulti(query, lang, page = 1) {
  lang = lang === undefined ? "en-US" : lang;
  const concodedQuery = encodeURIComponent(query);
  const data = await fetchData(
    BASE_API_URL +
      `search/multi?query=${concodedQuery}&include_adult=false&language=${lang}&page=${page}`,
  );

  return data;
}

async function getTopRated(k, lang, page = 1) {
  // k is either 'movie' or 'tv'
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL + `${k}/top_rated?language=${lang}&page=${page}`,
  );

  return data;
}

async function getMovieDetails(movie_id, lang) {
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL + `movie/${movie_id}?language=${lang}`,
  );

  return data;
}

async function getSeiresDetails(series_id, lang) {
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL + `tv/${series_id}?language=${lang}`,
  );

  return data;
}

async function getRecommendedMovies(movie_id, lang, page = 1) {
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL +
      `movie/${movie_id}/recommendations?language=${lang}&page=${page}`,
  );

  return data;
}

async function getRecommendedSeries(series_id, lang, page = 1) {
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL +
      `tv/${series_id}/recommendations?language=${lang}&page=${page}`,
  );

  return data;
}

async function getMovieReviews(movie_id, lang, page = 1) {
  // movie/{movie_id}/reviews
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL + `movie/${movie_id}/reviews?language=${lang}&page=${page}`,
  );

  return data;
}

async function getSeriesReviews(series_id, lang, page = 1) {
  // tv/{series_id}/reviews
  lang = lang === undefined ? "en-US" : lang;
  const data = await fetchData(
    BASE_API_URL + `tv/${series_id}/reviews?language=${lang}&page=${page}`,
  );

  return data;
}

async function getMedia(media_type, id) {
  const data = await fetchData(BASE_API_URL + `${media_type}/${id}/images`);

  return data;
}

async function getSeasonInfo(seriesId, seasonNumber, lang) {
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL + `tv/${seriesId}/season/${seasonNumber}?language=${lang}`,
  );

  return data;
}

async function getEpisodeInfo(seriesId, seasonNumber, epNum, lang) {
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL +
      `tv/${seriesId}/season/${seasonNumber}/episode/${epNum}?language=${lang}`,
  );

  return data;
}

async function getMatchedMedia(media_type, lang, genres, page = 1, keywords) {
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL +
      `discover/${media_type}?include_adult=false&include_video=false${genres ? `&with_genres=${encodeURIComponent(genres)}` : ""}${keywords ? `&with_keywords=${encodeURIComponent(keywords)}` : ""}&language=${lang}&page=${page}`,
  );

  return data;
}

async function getCredits(media_type, media_id, lang) {
  lang = lang === undefined ? "en-US" : lang;

  const data = await fetchData(
    BASE_API_URL + `${media_type}/${media_id}/credits?language=${lang}`,
  );

  return data;
}

async function getKeyword(keyword_query) {
  const data = await fetchData(
    BASE_API_URL + `search/keyword?query=${keyword_query}`,
  );

  return data;
}

async function getKeywords(media_type, media_id) {
  // media_type should be either movie ( as in https://api.themoviedb.org/3/movie/{movie_id}/keywords ) or tv (as in https://api.themoviedb.org/3/tv/{series_id}/keywords);

  const data = await fetchData(
    BASE_API_URL + `${media_type}/${media_id}/keywords`,
  );

  return data;
}

export {
  getCredits,
  getEpisodeInfo,
  getKeyword,
  getKeywords,
  getMatchedMedia,
  getMedia,
  getMovieDetails,
  getMovieReviews,
  getRecommendedMovies,
  getRecommendedSeries,
  getSeasonInfo,
  getSeiresDetails,
  getSeriesReviews,
  getTopRated,
  getTrending,
  searchMulti,
};
