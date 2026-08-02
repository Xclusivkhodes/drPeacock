import type { UserProfile } from "@/data/types";
import { buildBaselineSystemPrompt, buildUserDataSummary, parseBaselineCards } from "@/lib/baselinePrompt";

/**
 * Cloud health-baseline generation. Runs server-side only — this file is an
 * Expo Router API route (never bundled into the client app), so
 * process.env.NVIDIA_API_KEY is safe here. Same security model and same
 * OpenAI-compatible NVIDIA endpoint as app/api/chat+api.ts — the key must
 * NEVER be prefixed with EXPO_PUBLIC_ and never appears in a response body.
 */
const NVIDIA_MODEL = "google/gemma-4-31b-it";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 15_000;

interface BaselineRequestBody {
  profile?: UserProfile | null;
  language?: string;
}

interface NvidiaResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string } | string;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing NVIDIA_API_KEY." }, { status: 500 });
  }

  let body: BaselineRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.profile) {
    return Response.json({ error: "profile is required." }, { status: 400 });
  }
  const language = body.language || "English";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: buildBaselineSystemPrompt() },
          { role: "user", content: buildUserDataSummary(body.profile, language) },
        ],
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
        max_tokens: 1024,
        stream: false,
      }),
      signal: controller.signal,
    });

    const data: NvidiaResponse = await response.json();
    if (!response.ok) {
      const errorMessage = typeof data.error === "string" ? data.error : data.error?.message;
      return Response.json({ error: errorMessage || `NVIDIA API request failed with status ${response.status}` }, { status: 502 });
    }

    const rawText = data.choices?.[0]?.message?.content ?? "";
    if (!rawText) {
      return Response.json({ error: "NVIDIA API returned no content." }, { status: 502 });
    }

    const cards = parseBaselineCards(rawText);
    return Response.json({ cards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling the NVIDIA API.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
