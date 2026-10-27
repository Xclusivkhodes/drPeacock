import type { UserProfile } from "@/data/types";
import { generateWithGemma, type GemmaPart, type GemmaTurn } from "@/lib/aiStudio";
import { buildChatSystemPrompt } from "@/lib/chatPrompt";

/**
 * Cloud chat inference for Dr. Peacock. Runs server-side only — this file is
 * an Expo Router API route (never bundled into the client app), so
 * process.env.AI_STUDIO_API_KEY is safe here. It must NEVER be prefixed with
 * EXPO_PUBLIC_ and must never be returned in a response body.
 *
 * During local development the Expo dev server executes this route. A
 * standalone production build needs the routes deployed and
 * EXPO_PUBLIC_API_BASE_URL pointed at that host. See lib/apiBaseUrl.ts.
 */
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

export async function POST(request: Request): Promise<Response> {
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
  const instructions = buildChatSystemPrompt(profile, language);

  const turns: GemmaTurn[] = messages
    .filter((message) => typeof message.content === "string" && message.content.trim().length > 0)
    .map((message) => {
      const role: "user" | "model" = message.role === "assistant" ? "model" : "user";
      return { role, parts: [{ text: message.content }] };
    });

  if (turns.length === 0) {
    return Response.json({ error: "messages must include text." }, { status: 400 });
  }

  const first = turns[0];
  const firstText = first.parts[0];
  if (first.role === "user" && firstText && "text" in firstText) {
    first.parts[0] = { text: `${instructions}\n\n${firstText.text}` };
  }

  const last = turns[turns.length - 1];
  if (last.role === "user" && image?.data && image.mimeType) {
    const imagePart: GemmaPart = { inline_data: { mime_type: image.mimeType, data: image.data } };
    last.parts.push(imagePart);
  }

  try {
    const reply = await generateWithGemma(turns, 768);
    return Response.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling AI Studio.";
    const status = message.includes("AI_STUDIO_API_KEY") ? 500 : 502;
    return Response.json({ error: message }, { status });
  }
}
