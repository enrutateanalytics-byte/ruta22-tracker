import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCapacitor } from "./utils/capacitorUtils";

console.log("[App] Bootstrapping application...")

// Initialize Capacitor for native platforms (non-blocking)
initializeCapacitor()
  .then(() => {
    console.log("[App] Capacitor initialized successfully");
  })
  .catch((error) => {
    console.log("[App] Capacitor not available, continuing with web version:", error.message);
  });

createRoot(document.getElementById("root")!).render(<App />);
