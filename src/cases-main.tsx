import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CaseApp } from "./case-app";
import { initializeTheme } from "./theme-toggle";
const page = window.location.pathname.split("/").pop();
const id =
  page === "detail.html"
    ? "case-detail"
    : page === "workspace.html"
      ? "case-workspace"
      : page === "saas.html"
        ? "case-saas"
        : "case-gallery";
initializeTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CaseApp id={id} />
  </StrictMode>,
);
