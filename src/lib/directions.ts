import type { Facility } from "@/data/types";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import type { Coordinates } from "@/lib/places";

export interface RouteResult {
  /** Decoded turn-by-turn path, ready to hand straight to react-native-maps' <Polyline coordinates=.../>. */
  coordinates: Coordinates[];
  durationText: string;
  distanceText: string;
}

interface DirectionsApiResponse extends Partial<RouteResult> {
  error?: string;
}

/**
 * Fetches a driving route between two points via this app's own
 * app/api/directions+api.ts route — never calls Google's Directions API
 * directly from the client, so the API key never touches client code (see
 * that route for why, and the "Secret Rules" section of AGENTS.md).
 */
export async function fetchDirections(origin: Coordinates, destination: Coordinates): Promise<RouteResult> {
  const params = new URLSearchParams({
    originLat: String(origin.latitude),
    originLng: String(origin.longitude),
    destLat: String(destination.latitude),
    destLng: String(destination.longitude),
  });

  const response = await fetch(`${getApiBaseUrl()}/api/directions?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Directions request failed with status ${response.status}`);
  }
  const data: DirectionsApiResponse = await response.json();
  if (data.error || !data.coordinates || !data.durationText || !data.distanceText) {
    throw new Error(data.error || "Directions response was incomplete");
  }
  return { coordinates: data.coordinates, durationText: data.durationText, distanceText: data.distanceText };
}

/**
 * Maps a Facility into the string-only shape Expo Router needs for
 * `router.push({ pathname: "/directions", params })` — used by every
 * facility card that links to the Directions screen, so the field list
 * stays in exactly one place.
 */
export function buildDirectionsParams(facility: Facility): Record<string, string> {
  return {
    name: facility.name,
    type: facility.type,
    distance: facility.distance,
    wait: facility.wait,
    cost: facility.cost,
    status: facility.status,
    note: facility.note,
    latitude: String(facility.latitude),
    longitude: String(facility.longitude),
  };
}
