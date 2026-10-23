import type { UserProfile } from "@/data/types";
import { buildBaselineSystemPrompt, buildUserDataSummary, parseBaselineCards } from "@/lib/baselinePrompt";

/**
 * Cloud health-baseline generation. Runs server-side only — this file is an
 * Expo Router API route (never bundled into the client app), so
 * process.env.AI_STUDIO_API_KEY is safe here. Same security model and same
 * Google AI Studio Gemma endpoint as app/api/chat+api.ts — the key must
 * NEVER be prefixed with EXPO_PUBLIC_ and never appears in a response body.
 */
const AI_STUDIO_MODEL = "gemma-4-e2b-it";
const AI_STUDIO_URL = `https://generativelanguage.googleapis.com/v1beta/models/${AI_STUDIO_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 15_000;

interface BaselineRequestBody {
  profile?: UserProfile | null;
  language?: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.AI_STUDIO_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing AI_STUDIO_API_KEY." }, { status: 500 });
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
    const response = await fetch(AI_STUDIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildBaselineSystemPrompt() }] },
        contents: [{ role: "user", parts: [{ text: buildUserDataSummary(body.profile, language) }] }],
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal,
    });

    const data: GeminiResponse = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || `AI Studio request failed with status ${response.status}` },
        { status: 502 },
      );
    }

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    if (!rawText) {
      return Response.json({ error: "AI Studio returned no content." }, { status: 502 });
    }

    const cards = parseBaselineCards(rawText);
    return Response.json({ cards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling AI Studio.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
