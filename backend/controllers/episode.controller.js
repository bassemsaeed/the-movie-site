import { getEpisodeInfo } from "../services/tmdb.service.js";

async function episodeInfoController(req, res) {
  const { seriesId, seasonNum, episodeNum } = req.params;
  const { l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  try {
    const data = await getEpisodeInfo(seriesId, seasonNum, episodeNum, l);

    return res.status(200).json(data);
  } catch (e) {
    return res.json({
      status: "An error happend",
      message: "Check series id and season number, " + e.message,
    });
  }
}

export { episodeInfoController };
