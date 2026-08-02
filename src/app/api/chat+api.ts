import type { UserProfile } from "@/data/types";
import { buildChatSystemPrompt } from "@/lib/chatPrompt";
import { stripThinking } from "@/lib/thinking";

/**
 * Cloud chat inference for Dr. Peacock. Runs server-side only — this file is
 * an Expo Router API route (never bundled into the client app), so
 * process.env.NVIDIA_API_KEY is safe here. It must NEVER be prefixed with
 * EXPO_PUBLIC_ (that prefix is what tells Expo to inline a value into the
 * client bundle) and must never be returned in a response body.
 *
 * NVIDIA's hosted API (integrate.api.nvidia.com) is an OpenAI-compatible
 * chat-completions endpoint (it runs on vLLM's OpenAI server under the hood),
 * which is why the request/response shapes below look like OpenAI's rather
 * than Gemini's `contents`/`candidates` shape used by the old Google AI
 * Studio integration.
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
const NVIDIA_MODEL = "google/gemma-4-31b-it";
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 15_000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface IncomingImage {
  /** Base64-encoded bytes, no `data:` prefix. */
  data: string;
  mimeType: string;
}

interface ChatRequestBody {
  messages?: IncomingMessage[];
  profile?: UserProfile | null;
  language?: string;
  /** The most recent message's photo attachment, if any — see lib/gemma.ts. */
  image?: IncomingImage;
}

type NvidiaContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

interface NvidiaMessage {
  role: "system" | "user" | "assistant";
  content: string | NvidiaContentPart[];
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
  const image = body.image;

  const nvidiaMessages: NvidiaMessage[] = [
    { role: "system", content: buildChatSystemPrompt(profile, language) },
    ...messages
      .filter((message) => typeof message.content === "string" && message.content.trim().length > 0)
      .map((message, index, filtered) => {
        const role: "user" | "assistant" = message.role === "assistant" ? "assistant" : "user";
        const isLast = index === filtered.length - 1;
        // Only the most recent message's photo is attached as real image
        // data — see lib/gemma.ts for why (older attachments are described
        // as text only).
        if (isLast && image) {
          const parts: NvidiaContentPart[] = [
            { type: "text", text: message.content },
            { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.data}` } },
          ];
          return { role, content: parts };
        }
        return { role, content: message.content };
      }),
  ];

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
        messages: nvidiaMessages,
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
        max_tokens: 768,
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

    // Applied here too (not just client-side) so raw reasoning never leaves
    // this route even if the client's own defensive strip were ever removed.
    const reply = stripThinking(rawText);
    return Response.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling the NVIDIA API.";
    return Response.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
