import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./design/global.css";
import "./design/app.css";
import { App } from "./app/App";

// Cache the app on first visit so it opens with no internet afterwards.
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
