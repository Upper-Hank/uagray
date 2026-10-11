import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LabApp from "./App";
import "../src/base.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LabApp />
  </StrictMode>,
);
