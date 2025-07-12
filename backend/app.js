import "./config/dotenv.config.js"; // initialize environment vars
import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import {
  getTrendingController,
  searchController,
  movieDetailsController,
  topRatedMoviesAndSeriesController,
  reviewsController,
  recommendedController,
  seriesDetailsController,
  mediaController,
  seasonInfoController,
  episodeInfoController,
  discoverMediaController,
  keywordsController,
  mediaKeywordsController,
  creditsController,
  aiRecommendationController,
} from "./controllers/all-controller.js";
import { limit } from "./middlewares/ratelimiterforai.middleware.js";

const app = express();

app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 800, // Limit each IP to 800 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // `RateLimit-*` headers
  legacyHeaders: false, // no X-RateLimit headers
});

app.use(
  cors({
    origin: "http://localhost:5173", // 👈 Allow only your frontend (this is for local testing purposes, and i have to actually set it to the website link in production)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  })
);

app.use(limiter);

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

// ai recommendation
app.get("/airecommend", limit, aiRecommendationController);

export { app };
