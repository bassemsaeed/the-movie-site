import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";
import Discover from "./pages/Discover.jsx";
import WatchLater from "./pages/WatchLater.jsx";
import Movie from "./pages/MediaDetails.jsx";
import HomePage from "./pages/HomePage.jsx";
import Hero from "./components/Hero.jsx";

const router = createBrowserRouter([
  {
    Component: HomePage,
    children: [
      { index: true, Component: Hero },
      { path: "discover", Component: Discover },
    ],
  },
  {
    path: "/watchlater",
    Component: WatchLater,
  },
  {
    path: "/movies/:movieId",
    Component: Movie,
    loader: async ({ params, request }) => {
      const { movieId } = params;
      const url = new URL(request.url);
      const lang = url.searchParams.get("l") === "ar" ? "ar" : "en";

      const response = await Promise.allSettled([
        axios.get(`http://localhost:3000/movies/${movieId}?l=${lang}`),
        axios.get(`http://localhost:3000/reviews/${movieId}?k=movie&l=${lang}`),
        axios.get(
          `http://localhost:3000/recommended/${movieId}?k=movie&l=${lang}`,
        ),
        axios.get(`http://localhost:3000/media/movie/${movieId}`),
        axios.get(`http://localhost:3000/movie/${movieId}/keywords`),
      ]);

      return { results: response, lang, media_type: "movie" };
    },
  },
  {
    path: "/series/:seriesId",
    Component: Movie,
    loader: async ({ params, request }) => {
      const { seriesId } = params;
      const url = new URL(request.url);

      const lang = url.searchParams.get("l") === "ar" ? "ar" : "en";

      const response = await Promise.allSettled([
        axios.get(`http://localhost:3000/series/${seriesId}?l=${lang}`),
        axios.get(`http://localhost:3000/reviews/${seriesId}?k=tv&l=${lang}`),
        axios.get(
          `http://localhost:3000/recommended/${seriesId}?k=tv&l=${lang}`,
        ),
        axios.get(`http://localhost:3000/media/tv/${seriesId}`),
        axios.get(`http://localhost:3000/tv/${seriesId}/keywords`),
      ]);

      return { results: response, lang, media_type: "tv" };
    },
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </StrictMode>,
);
