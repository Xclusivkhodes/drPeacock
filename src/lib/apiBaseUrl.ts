import Constants from "expo-constants";

/**
 * Resolves the base URL for this app's own Expo Router API routes
 * (app/api/*.ts). In development, native clients can't use a relative fetch
 * the way a browser would, so this derives the Metro dev server's LAN host
 * from expo-constants. Once an API route is deployed for real (e.g. via
 * `eas deploy`, which needs app.json's web.output set to "server"), set
 * EXPO_PUBLIC_API_BASE_URL to that deployed URL and it takes priority.
 * Shared by every lib/ helper that calls one of this app's own API routes
 * (lib/gemma.ts, lib/directions.ts), so the dev/prod URL resolution logic
 * lives in exactly one place.
 */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    throw new Error("Could not determine the dev server host for this app's own API routes.");
  }
  return `http://${hostUri.split(",")[0]}`;
}
