import React from "react";
import ReactDom from "react-dom/client";
import App from "./App";
import "./index.css";
import "@fontsource/inter";

ReactDom.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
