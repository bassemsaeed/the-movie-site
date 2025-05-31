import express from "express";
import { getTrendingController } from "./controllers/trending.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("<h1 style='color: red;'>Hello world</h1>");
});

app.get("/trending", getTrendingController);



app.listen(PORT, () => {
  console.log("running on http://localhost:3000");
});
