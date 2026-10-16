import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/geist-mono/400.css";
import "./portal.css";
import { Portal } from "./Portal.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Portal />
  </React.StrictMode>,
);
