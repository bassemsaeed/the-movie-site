import axios from "axios";
import { config } from "dotenv";
config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_API_URL = "https://api.themoviedb.org/3/";

async function getTrending(key, lang) {
  lang = lang === undefined ? "en-US" : lang;

  const { data } = await axios.get(
    BASE_API_URL + `trending/${key}/week?language=${lang}`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
        Accept: "application/json",
      },
    }
  );

  return data;
}

export { getTrending };
