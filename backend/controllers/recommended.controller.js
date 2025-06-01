import {
  getRecommendedMovies,
  getRecommendedSeries,
} from "../services/tmdb.service.js";

async function recommendedController(req, res) {
  const { id } = req.params;
  const { k, l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  if (k === "movie") {
    const data = await getRecommendedMovies(id, l);
    return res.status(200).json(data);
  } else if (k === "tv") {
    const data = await getRecommendedSeries(id, l);
    return res.status(200).json(data);
  } else {
    return res.json({ message: "invalid key -> " + k });
  }
}

export { recommendedController };
