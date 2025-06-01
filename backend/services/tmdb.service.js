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

export { getTrending, searchMulti };
