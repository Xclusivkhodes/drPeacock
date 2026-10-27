import type { UserProfile } from "@/data/types";
import { generateWithGemma } from "@/lib/aiStudio";
import { buildBaselineSystemPrompt, buildUserDataSummary, parseBaselineCards } from "@/lib/baselinePrompt";

/**
 * Cloud health-baseline generation. Runs server-side only. Same Google AI
 * Studio key and model as app/api/chat+api.ts. The key must NEVER be prefixed
 * with EXPO_PUBLIC_ and never appears in a response body.
 */
interface BaselineRequestBody {
  profile?: UserProfile | null;
  language?: string;
}

export async function POST(request: Request): Promise<Response> {
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

  try {
    const rawText = await generateWithGemma(
      [
        {
          role: "user",
          parts: [{ text: `${buildBaselineSystemPrompt()}\n\n${buildUserDataSummary(body.profile, language)}` }],
        },
      ],
      1024,
    );
    const cards = parseBaselineCards(rawText);
    return Response.json({ cards });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error calling AI Studio.";
    const status = message.includes("AI_STUDIO_API_KEY") ? 500 : 502;
    return Response.json({ error: message }, { status });
  }
}
