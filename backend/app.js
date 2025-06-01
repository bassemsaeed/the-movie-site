import "./config/dotenv.config.js"; // initialize environment vars
import express from "express";
import { getTrendingController } from "./controllers/trending.controller.js";
import { searchController } from "./controllers/search.controller.js";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // `RateLimit-*` headers
  legacyHeaders: false, // no X-RateLimit headers
});

app.use(cors({
  origin: 'http://localhost:5173',  // 👈 Allow only your frontend (this is for local testing purposes, and i have to actually set it to the website link in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE']  // Allowed methods
}));

app.use(limiter);

app.get("/", (req, res) => {
  res.send("<h1 style='color: red;'>Hello world</h1>");
});

app.get("/trending", getTrendingController);

app.get("/search", searchController);

app.listen(PORT, () => {
  console.log("running on http://localhost:3000");
});
