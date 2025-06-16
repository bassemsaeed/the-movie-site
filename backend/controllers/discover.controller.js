import { getMatchedMedia } from "../services/tmdb.service.js";

async function discoverMediaController(req, res) {
  const { mediaType } = req.params;
  const { genres, keywords, l, page } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.status(400).json({
      status: "Bad request",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  try {
    const data = await getMatchedMedia(mediaType, l, genres, page, keywords);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      status: "Interal server error",
      message: "Could't fetch the data -> " + error.message,
    });
  }
}

export { discoverMediaController };
