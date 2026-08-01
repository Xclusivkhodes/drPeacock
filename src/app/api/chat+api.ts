import type { UserProfile } from "@/data/types";
import { buildChatSystemPrompt } from "@/lib/chatPrompt";
import { stripThinking } from "@/lib/thinking";

/**
 * Cloud chat inference for Dr. Peacock. Runs server-side only — this file is
 * an Expo Router API route (never bundled into the client app), so
 * process.env.AI_STUDIO_API_KEY is safe here. It must NEVER be prefixed with
 * EXPO_PUBLIC_ (that prefix is what tells Expo to inline a value into the
 * client bundle) and must never be returned in a response body.
 *
 * During local development (`expo start --dev-client`), the dev server
 * already executes this route for the connected native app — no extra config
 * needed. To reach it from a standalone production build, deploy it (e.g.
 * `eas deploy`, which needs app.config.js's web.output set to "server") and
 * point the client at that URL via EXPO_PUBLIC_API_BASE_URL (see
 * lib/apiBaseUrl.ts). Note: flipping web.output to "server" also makes Expo
 * Router attempt to server-render every screen for the web target, which
 * breaks here since several screens depend on native-only modules
 * (expo-audio, expo-image-picker) — that's a separate change to make
 * carefully when deploying, not a pure config flip.
 */
const AI_STUDIO_MODEL = "gemma-4-e2b-it";
const AI_STUDIO_URL = `https://generativelanguage.googleapis.com/v1beta/models/${AI_STUDIO_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 15_000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages?: IncomingMessage[];
  profile?: UserProfile | null;
  language?: string;
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.AI_STUDIO_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server is missing AI_STUDIO_API_KEY." }, { status: 500 });
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return Response.json({ error: "messages must be a non-empty array." }, { status: 400 });
  }
  const language = body.language || "English";
  const profile = body.profile ?? null;

  const contents = messages
    .filter((message) => typeof message.content === "string" && message.content.trim().length > 0)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${AI_STUDIO_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildChatSystemPrompt(profile, language) }] },
        contents,
        generationConfig: {
          temperature: 1.0,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 768,
        },
      }),
      signal: controller.signal,
    });

    const data: GeminiResponse = await response.json();
    if (!response.ok) {
      return Response.json({ error: data.error?.message || `AI Studio request failed with status ${response.status}` }, { status: 502 });
    }

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    if (!rawText) {
      return Response.json({ error: "AI Studio returned no content." }, { status: 502 });
    }

    // Applied here too (not just client-side) so raw reasoning never leaves
    // this route even if the client's own defensive strip were ever removed.
    const reply = stripThinking(rawText);
    return Response.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling AI Studio.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
