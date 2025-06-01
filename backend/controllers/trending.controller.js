import { getTrending } from "../services/tmdb.service.js";

async function getTrendingController(req, res) {
  const { k, l } = req.query;

  // check if correct lang choice, if not return an error and terminate function execution
  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  // handle each key
  if (k === "all" || k === "movie" || k === "tv") {
    const data = await getTrending(k, l);
    res.send(data);
  } else {
    res.json({
      status: "Error",
      cause:
        k === undefined
          ? "You didn't specify a keyword (eg. /trending?k='all')"
          : "Unkownd keyword -> " + k,
    });
  }
}

export { getTrendingController };
