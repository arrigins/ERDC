import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/geist-mono/400.css";
import "./oc.css";
import { OverviewCovers } from "./OverviewCovers.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OverviewCovers />
  </React.StrictMode>,
);
