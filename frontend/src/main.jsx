import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { Home } from "./App.jsx";
import Discover from "./pages/Discover.jsx";
import Main from "./pages/HomePage.jsx";
import WatchLater from "./pages/WatchLater.jsx";

const router = createBrowserRouter([
  {
    element: <Home />,
    children: [
      { index: true, Component: Main },
      { path: "discover", Component: Discover },
    ],
  },
  {
    path: "/watchlater",
    element: <WatchLater />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </StrictMode>
);
