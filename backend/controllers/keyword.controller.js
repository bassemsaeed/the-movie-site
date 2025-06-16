import { getKeywords } from "../services/tmdb.service.js";

async function keywordsController(req, res) {
  const { keyQuery } = req.params;

  try {
    const data = await getKeywords(keyQuery);
    return res.json(data);
  } catch (error) {
    res.status(500).json({
      status: "Internal server error",
      message: "Could't fetch the keywords -> " + error.message,
    });
  }
}

export { keywordsController };
