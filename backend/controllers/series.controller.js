import { getSeiresDetails } from "../services/tmdb.service.js";

async function seriesDetailsController(req, res) {
  const { series_id } = req.params;
  const { l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  const data = await getSeiresDetails(series_id, l);

  return res.status(200).json(data);
}

export { seriesDetailsController };
