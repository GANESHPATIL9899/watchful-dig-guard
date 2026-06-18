/**
 * Environment configuration — single source of truth for API mode.
 * To switch from mock to live backend, set VITE_USE_MOCK=false and
 * VITE_API_BASE_URL=https://your-server.com/api. No component changes required.
 */
export const env = {
  USE_MOCK: (import.meta.env.VITE_USE_MOCK ?? "true") !== "false",
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  APP_NAME: "Site Safety Hub",
  APP_TAGLINE: "AI-Powered Excavator Blind-Spot Safety Monitoring",
};
