import "./config/dotenv.config.js"; // initialize environment vars
import express from "express";
import { getTrendingController } from "./controllers/trending.controller.js";
import { searchController } from "./controllers/search.controller.js";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import {
  movieDetailsController,
  topRatedMoviesAndSeriesController,
} from "./controllers/movie.controller.js";
import { reviewsController } from "./controllers/reviews.controller.js";
import { recommendedController } from "./controllers/recommended.controller.js";
import { seriesDetailsController } from "./controllers/series.controller.js";
import { mediaController } from "./controllers/media.controller.js";
import { seasonInfoController } from "./controllers/seasons.controller.js";
import { episodeInfoController } from "./controllers/episode.controller.js";
import { discoverMediaController } from "./controllers/discover.controller.js";
import { keywordsController } from "./controllers/keyword.controller.js";
import { mediaKeywordsController } from "./controllers/mediaKeywords.controller.js";
import { creditsController } from "./controllers/credits.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 800, // Limit each IP to 500 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // `RateLimit-*` headers
  legacyHeaders: false, // no X-RateLimit headers
});

app.use(
  cors({
    origin: "http://localhost:5173", // 👈 Allow only your frontend (this is for local testing purposes, and i have to actually set it to the website link in production)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  }),
);

app.use(limiter);

app.get("/", (req, res) => {
  res.send("<h1 style='color: red;'>Hello world</h1>");
});

// general movies and series and characters endpoints/routes
app.get("/trending", getTrendingController);
app.get("/recommended/:id", recommendedController);
app.get("/reviews/:id", reviewsController);
app.get("/top_rated", topRatedMoviesAndSeriesController);
app.get("/search", searchController);

app.get("/media/:mediaType/:mediaId", mediaController);

// movies
app.get("/movies/:movie_id", movieDetailsController);

// series
app.get("/series/:series_id", seriesDetailsController);
app.get("/season/:seriesId/:seasonNum", seasonInfoController);
app.get("/episode/:seriesId/:seasonNum/:episodeNum", episodeInfoController);

// discover series and movies with genres
app.get("/discover/:mediaType", discoverMediaController);
app.get("/keywords/:keyQuery", keywordsController);

// keywords for each specific movie or series
app.get("/:mediaType/:mediaId/keywords", mediaKeywordsController);

// credits for any movie or series
app.get("/:mediaType/:mediaId/credits", creditsController);

app.listen(PORT, () => {
  console.log("running on http://localhost:3000");
});