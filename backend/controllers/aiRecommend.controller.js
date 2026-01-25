import { getEmbedding } from "../services/gemini.service.js";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:password@localhost:5432/postgres",
});

async function aiRecommendationController(req, res) {
  const { prompt, l } = req.query;

  if (l !== "ar" && l !== "en" && l !== undefined) {
    return res.status(400).json({ status: "Bad request", cause: "Unknown language" });
  }
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ success: false, message: "Please provide a prompt." });
  }

  req.on("close", () => res.end());
  const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    sendEvent({ success: true, start: true, message: "Thinking..." });

    // 1. Embed
    const vector = await getEmbedding(prompt);
    const vectorString = `[${vector.join(",")}]`;

    // 2. Search DB 
    // We increase LIMIT to 40 to ensure we get a mix of movies and shows
    const dbResult = await pool.query(`
      SELECT id, title, overview, poster_path, release_date, media_type,
             1 - (embedding <=> $1::vector) as similarity
      FROM movies
      ORDER BY embedding <=> $1::vector
      LIMIT 60
    `, [vectorString]);

    // 3. Separate the results
    const movieResults = [];
    const seriesResults = [];

    dbResult.rows.forEach(row => {
      // Common fields for both
      const commonData = {
        id: Number(row.id),
        overview: row.overview,
        poster_path: row.poster_path,
        media_type: row.media_type, // 'movie' or 'tv'
        vote_average: row.similarity * 10,
        vote_count: 100,
        backdrop_path: row.poster_path // Fallback if you don't have backdrops
      };

      if (row.media_type === 'tv' || row.media_type === 'series') {
        // TV SERIES FORMATTING
        seriesResults.push({
          ...commonData,
          name: row.title,           // TMDB standard: TV uses 'name'
          original_name: row.title,
          first_air_date: row.release_date, // TMDB standard: TV uses 'first_air_date'
        });
      } else {
        // MOVIE FORMATTING
        movieResults.push({
          ...commonData,
          title: row.title,
          original_title: row.title,
          release_date: row.release_date
        });
      }
    });

    // 4. Construct Response Objects
    const moviesFormatted = {
      page: 1,
      results: movieResults,
      total_pages: 1,
      total_results: movieResults.length,
    };

    const seriesFormatted = {
      page: 1,
      results: seriesResults,
      total_pages: 1,
      total_results: seriesResults.length,
    };

    const metaData = {
      search_title: "AI Recommendations",
      note: `Found ${movieResults.length} movies and ${seriesResults.length} series.`
    };

    sendEvent({
      success: true,
      end: true,
      message: "Here are your recommendations!",
      value: [moviesFormatted, seriesFormatted, metaData]
    });

  } catch (error) {
    console.error("AI Controller Error:", error);
    sendEvent({ success: false, message: "AI Error: " + error.message });
  } finally {
    res.end();
  }
}

export { aiRecommendationController };
