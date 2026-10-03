// ─────────────────────────────────────────────
// Ilova ildizi
// ─────────────────────────────────────────────
// ErrorBoundary butun ilovani o'raydi — undan tashqarida hech narsa yo'q.
// Shu sababli App ichida xato chiqsa ham, oq ekran ko'rinmasdi.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { ErrorBoundary } from "./App.jsx";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Ilova butunlay oq qolib ketmasligi uchun oxirgi himoya:
// "root" elementi hamda Telegram'ning o'z xatolari ham ushlansin
window.addEventListener("error", e => console.error("[PremoLux] window error:", e.error || e.message));
window.addEventListener("unhandledrejection", e =>
  console.error("[PremoLux] unhandled rejection:", e.reason));
