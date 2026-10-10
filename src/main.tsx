import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeTheme } from "./theme-toggle";
const legacyCases: Record<string, string> = {
  "#case-gallery": "/cases/",
  "#case-workspace": "/cases/workspace.html",
  "#case-saas": "/cases/saas.html",
  "#case-detail": "/cases/detail.html",
};
const legacyCase = legacyCases[window.location.hash];
if (legacyCase) window.location.replace(legacyCase);
initializeTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
