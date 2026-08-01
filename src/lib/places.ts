import * as Location from "expo-location";

import type { Facility } from "@/data/types";

/**
 * Google Places API (legacy Nearby Search). Requires a Google Cloud project
 * with the Places API enabled and billing configured — set the key in
 * `.env` as EXPO_PUBLIC_GOOGLE_PLACES_API_KEY (see .env.example). Since this
 * app has no backend, the key ships in the client bundle like the Clerk key
 * does; restrict it in Google Cloud Console (Android package + SHA-1, and/or
 * API restriction to Places API) to limit abuse if it's ever extracted.
 */
const GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

// Escalating search radii (metres) — healthcare listing density varies a lot
// by area, so a tight radius can come back empty in less-mapped suburbs.
const SEARCH_RADII_METERS = [5000, 20000];

/** Hard cap so a slow/hanging connection aborts quickly and falls back to
 * the static offline facility data instead of leaving the UI stuck loading. */
const REQUEST_TIMEOUT_MS = 5000;

interface GooglePlaceResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  vicinity?: string;
  opening_hours?: { open_now?: boolean };
  business_status?: string;
  rating?: number;
  types?: string[];
}

interface GooglePlacesResponse {
  results?: GooglePlaceResult[];
  status: string;
  error_message?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS_KM = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);
  const h = sinHalfLat * sinHalfLat + Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.max(1, Math.round(km * 1000))} m` : `${km.toFixed(1)} km`;
}

function describePlaceType(types?: string[]): string {
  if (types?.includes("hospital")) return "Hospital";
  if (types?.includes("doctor")) return "Clinic";
  if (types?.includes("health")) return "Health centre";
  return "Healthcare facility";
}

/** Google reports real open/closed state (unlike OSM's spotty tagging), so
 * this reflects the actual API value instead of a heuristic guess. */
function describeStatus(place: GooglePlaceResult): string {
  if (place.business_status === "CLOSED_PERMANENTLY") return "Permanently closed";
  if (place.opening_hours?.open_now === true) return "Open now";
  if (place.opening_hours?.open_now === false) return "Closed now";
  return "Hours unknown";
}

/** Google's 0–5 star rating doesn't map to a "match score" the way the old
 * static facility data did — shown as a rough percentage, or "—" if unrated. */
function describeScore(rating?: number): string {
  return rating ? `${Math.round((rating / 5) * 100)}%` : "—";
}

/**
 * Requests foreground location permission and returns the device's current
 * coordinates, or null if permission was denied.
 */
export async function getCurrentCoords(): Promise<Coordinates | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { latitude: position.coords.latitude, longitude: position.coords.longitude };
}

async function queryNearbyPlaces(origin: Coordinates, radiusMeters: number): Promise<GooglePlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GOOGLE_PLACES_API_KEY — set it in .env to enable live facility search.");
  }

  const params = new URLSearchParams({
    location: `${origin.latitude},${origin.longitude}`,
    radius: String(radiusMeters),
    type: "hospital",
    key: GOOGLE_PLACES_API_KEY,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${GOOGLE_PLACES_URL}?${params.toString()}`, {
      method: "GET",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Google Places request failed with status ${response.status}`);
    }
    const data: GooglePlacesResponse = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}${data.error_message ? ` — ${data.error_message}` : ""}`);
    }
    return data.results ?? [];
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches the `limit` nearest hospitals/clinics to `origin` from the Google
 * Places API, filling in realistic placeholders for the fields it doesn't
 * provide (wait time, cost).
 */
export async function fetchNearbyFacilities(origin: Coordinates, limit = 3): Promise<Facility[]> {
  let results: GooglePlaceResult[] = [];

  for (const radius of SEARCH_RADII_METERS) {
    results = await queryNearbyPlaces(origin, radius);
    if (results.length >= limit) break;
  }

  return results
    .map((place) => {
      const { lat, lng } = place.geometry.location;
      const distanceKm = haversineDistanceKm(origin, { latitude: lat, longitude: lng });
      const facility: Facility = {
        name: place.name,
        type: describePlaceType(place.types),
        score: describeScore(place.rating),
        distance: formatDistance(distanceKm),
        wait: "~15 min",
        cost: "₵ low",
        status: describeStatus(place),
        note: place.vicinity ?? "",
        latitude: lat,
        longitude: lng,
      };
      return { facility, distanceKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map((item) => item.facility);
}
