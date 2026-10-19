import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import { startThemeClock } from "../lib/theme";
import { GalleryPage } from "./GalleryPage.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

startThemeClock();

createRoot(root).render(
  <StrictMode>
    <GalleryPage />
  </StrictMode>,
);
