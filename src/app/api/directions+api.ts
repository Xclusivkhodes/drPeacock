import type { Coordinates } from "@/lib/places";

/**
 * Secure proxy for the Google Directions API. Runs server-side only — this
 * file is an Expo Router API route (never bundled into the client app), so
 * process.env.GOOGLE_DIRECTIONS_API_KEY is safe here. It must NEVER be
 * prefixed with EXPO_PUBLIC_ (that prefix inlines a value into the client
 * bundle) and the client never sees it — only the decoded route this route
 * hands back (see lib/directions.ts, which calls this instead of Google
 * directly).
 */
const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";
const REQUEST_TIMEOUT_MS = 10_000;

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes?: {
    overview_polyline?: { points?: string };
    legs?: { duration?: { text?: string }; distance?: { text?: string } }[];
  }[];
}

/** Decodes Google's encoded polyline format into plain lat/lng points that
 * react-native-maps' <Polyline coordinates=.../> can render directly. */
function decodePolyline(encoded: string): Coordinates[] {
  const points: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

export async function GET(request: Request): Promise<Response> {
  const apiKey = process.env.GOOGLE_DIRECTIONS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing GOOGLE_DIRECTIONS_API_KEY." }, { status: 500 });
  }

  const url = new URL(request.url);
  const originLat = url.searchParams.get("originLat");
  const originLng = url.searchParams.get("originLng");
  const destLat = url.searchParams.get("destLat");
  const destLng = url.searchParams.get("destLng");

  if (!originLat || !originLng || !destLat || !destLng) {
    return Response.json({ error: "originLat, originLng, destLat, and destLng are all required." }, { status: 400 });
  }

  const params = new URLSearchParams({
    origin: `${originLat},${originLng}`,
    destination: `${destLat},${destLng}`,
    mode: "driving",
    key: apiKey,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${DIRECTIONS_URL}?${params.toString()}`, { signal: controller.signal });
    const data: GoogleDirectionsResponse = await response.json();

    if (!response.ok || data.status !== "OK") {
      return Response.json({ error: data.error_message || `Directions API error: ${data.status}` }, { status: 502 });
    }

    const route = data.routes?.[0];
    const leg = route?.legs?.[0];
    const encodedPolyline = route?.overview_polyline?.points;
    if (!route || !leg || !encodedPolyline) {
      return Response.json({ error: "Directions API returned no usable route." }, { status: 502 });
    }

    return Response.json({
      coordinates: decodePolyline(encodedPolyline),
      durationText: leg.duration?.text ?? "—",
      distanceText: leg.distance?.text ?? "—",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling the Directions API.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
