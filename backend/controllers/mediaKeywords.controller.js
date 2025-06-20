import { getKeywords } from "../services/tmdb.service.js";

async function mediaKeywordsController(req, res) {
  const { mediaType, mediaId } = req.params;


  try {
    const data = await getKeywords(mediaType, mediaId);
    return res.status(200).json(data);
  } catch (error) {
     return res.status(500).json({
      status: "Interal server error",
      message: "Could't fetch the keyowrds -> " + error.message,
    });
  }
}


export { mediaKeywordsController };

