import { getMovieDetails, getTopRated } from "../services/tmdb.service.js";

async function movieDetailsController(req, res) {
  const { movie_id } = req.params;
  const { l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  const data = await getMovieDetails(movie_id, l);

  return res.status(200).json(data);
}

async function topRatedMoviesAndSeriesController(req, res) {
  const { k, l } = req.query;
  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  if (k === "movie" || k === "tv") {
    const data = await getTopRated(k, l);
    return res.status(200).json(data);
  }

  return res.json({ message: "invalid key -> " + k });
}

export { movieDetailsController, topRatedMoviesAndSeriesController };
