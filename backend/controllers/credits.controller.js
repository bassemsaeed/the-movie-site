import { getCredits } from "../services/tmdb.service.js";

async function creditsController(req, res) {
  const { mediaType, mediaId } = req.params;
  const { l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.status(400).json({
      status: "Bad request",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  try {
    const results = await getCredits(mediaType, mediaId, l);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      status: "Interal server error",
      message: "Could't fetch the credits data -> " + error.message,
    });
  }
}

export { creditsController };
