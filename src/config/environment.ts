/**
 * Environment configuration — single source of truth for API mode.
 * To switch from mock to live backend, set VITE_USE_MOCK=false and
 * VITE_API_BASE_URL=https://your-server.com/api. No component changes required.
 */
const isProduction = import.meta.env.PROD;
export const env = {
  USE_MOCK: (import.meta.env.VITE_USE_MOCK ?? "true") !== "false",
  BASE_URL: isProduction 
    ? (import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes("localhost") 
        ? import.meta.env.VITE_API_BASE_URL 
        : "/api")
    : (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api"),
  LIVE_REFRESH_MS: Number(import.meta.env.VITE_LIVE_REFRESH_MS ?? 3000),
  APP_NAME: "Site Safety Hub",
  APP_TAGLINE: "AI-Powered Excavator Blind-Spot Safety Monitoring",
};
