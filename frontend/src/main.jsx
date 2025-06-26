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

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
        axios.get(`${API_BASE_URL}movies/${movieId}?l=${lang}`),
        axios.get(`${API_BASE_URL}reviews/${movieId}?k=movie&l=${lang}`),
        axios.get(`${API_BASE_URL}recommended/${movieId}?k=movie&l=${lang}`),
        axios.get(`${API_BASE_URL}media/movie/${movieId}`),
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
        axios.get(`${API_BASE_URL}series/${seriesId}?l=${lang}`),
        axios.get(`${API_BASE_URL}reviews/${seriesId}?k=tv&l=${lang}`),
        axios.get(`${API_BASE_URL}recommended/${seriesId}?k=tv&l=${lang}`),
        axios.get(`${API_BASE_URL}media/tv/${seriesId}`),
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
