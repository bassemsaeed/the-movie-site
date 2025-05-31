import "./config/dotenv.config.js"; // initialize environment vars
import express from "express";
import {
  getTrendingController,
  searchController,
} from "./controllers/trending.controller.js";
import { rateLimit } from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // `RateLimit-*` headers
  legacyHeaders: false, // no X-RateLimit headers 
});


app.use(limiter);

app.get("/", (req, res) => {
  res.send("<h1 style='color: red;'>Hello world</h1>");
});

app.get("/trending", getTrendingController);

app.get("/search", searchController);

app.listen(PORT, () => {
  console.log("running on http://localhost:3000");
});
