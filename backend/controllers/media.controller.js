import { getMedia } from "../services/tmdb.service.js";

async function mediaController(req, res) {
  const { mediaType, mediaId } = req.params;

  if (mediaType !== "movie" && mediaType !== "tv") {
    return res.status(400).json({
      status: "Bad request",
      message: "the media type can either be a movie or tv",
    });
  }

  if (isNaN(Number(mediaId))) {
    return res.status(400).json({
      status: "Bad request",
      message: "the media id must be a valid integer id",
    });
  }

  const data = await getMedia(mediaType, mediaId);

  res.status(200).json(data);
}

export { mediaController };
