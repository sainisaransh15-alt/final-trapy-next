import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure root element exists and wrap in try-catch for safety
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    rootElement.innerHTML = `
      <div style="padding:40px;text-align:center;font-family:system-ui,sans-serif;">
        <h1 style="color:#dc2626;">Failed to load application</h1>
        <p style="color:#666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="margin-top:20px;padding:10px 20px;background:#4F46E5;color:white;border:none;border-radius:8px;cursor:pointer;">Reload</button>
      </div>
    `;
  }
}
