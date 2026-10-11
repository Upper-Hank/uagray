import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GalleryApp from "./gallery";
import "../src/base.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GalleryApp />
  </StrictMode>,
);
