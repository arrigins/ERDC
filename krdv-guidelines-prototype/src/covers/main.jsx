import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/geist-mono/400.css";
import "./covers.css";
import { Covers } from "./Covers.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Covers />
  </React.StrictMode>,
);
