import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCapacitor } from "./utils/capacitorUtils";

console.log("[App] Bootstrapping application...")

// Initialize Capacitor for native platforms
initializeCapacitor().then(() => {
  console.log("[App] Capacitor initialized successfully");
}).catch((error) => {
  console.error("[App] Capacitor initialization failed:", error);
});

createRoot(document.getElementById("root")!).render(<App />);
