import { searchMulti } from "../services/tmdb.service.js";

async function searchController(req, res) {
  const { q, l, page } = req.query;
  const validPageNum = page ?? "1";

  // check if correct lang choice, if not return an error and terminate function execution
  if (l !== "ar" && l !== "en" && l !== undefined) {
    res.json({
      status: "Error",
      cause: "Unkown language choice -> " + l,
    });

    return;
  }

  const data = await searchMulti(q, l, validPageNum);
  res.status(200).json(data);
}

export { searchController };
