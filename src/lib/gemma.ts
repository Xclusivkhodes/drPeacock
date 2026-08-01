import { buildFallbackBaseline } from "@/data/healthBaseline";
import type { BaselineCard, ChatMessage, UserProfile } from "@/data/types";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { stripThinking } from "@/lib/thinking";

/**
 * Client-side wrappers around Dr. Peacock's cloud AI (Gemma-4-E2B-it served
 * through the Google AI Studio API). All inference happens strictly
 * server-side, via this app's own Expo Router API routes
 * (app/api/chat+api.ts, app/api/baseline+api.ts) — process.env.AI_STUDIO_API_KEY
 * never reaches this file or the client bundle.
 */
const MAX_CHAT_HISTORY_TURNS = 12;

interface BaselineResponse {
  cards?: BaselineCard[];
  error?: string;
}

/**
 * Generates Dr. Peacock's personalized health-baseline cards via
 * app/api/baseline+api.ts. Falls back to a static, profile-derived baseline
 * if the request fails for any reason (offline, server error, malformed
 * response) so onboarding never gets stuck waiting on the network.
 */
export async function generateHealthBaseline(profile: UserProfile, language: string): Promise<BaselineCard[]> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/baseline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, language }),
    });
    if (!response.ok) {
      throw new Error(`Baseline request failed with status ${response.status}`);
    }
    const data: BaselineResponse = await response.json();
    if (data.error || !data.cards?.length) {
      throw new Error(data.error || "Baseline response contained no cards");
    }
    return data.cards;
  } catch (error) {
    console.warn("Cloud health-baseline generation failed, using offline fallback:", error);
    return buildFallbackBaseline(profile);
  }
}

interface OutgoingChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CloudChatResponse {
  reply?: string;
  error?: string;
}

export interface ChatReplyResult {
  text: string;
}

/**
 * Generates Dr. Peacock's next chat reply from the full message history (the
 * multi-turn chat store is the single source of truth — see
 * store/useChatStore.ts). The last entry in `history` is the patient's
 * current turn. Forwards the trimmed history to app/api/chat+api.ts, which
 * securely calls the Google AI Studio API server-side. Only the most recent
 * message's photo/voice attachment (if any) is described as text, since media
 * isn't proxied to the cloud API.
 */
export async function generateChatReply(history: ChatMessage[], profile: UserProfile | null, language: string): Promise<ChatReplyResult> {
  const recent: OutgoingChatMessage[] = history.slice(-MAX_CHAT_HISTORY_TURNS).map((message) => ({
    role: message.from === "ai" ? "assistant" : "user",
    content:
      message.text ||
      (message.audioUri ? "[Voice message — not available to the assistant]" : "") ||
      (message.attachmentUri ? "[Photo — not available to the assistant]" : ""),
  }));

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: recent, profile, language }),
    });
    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }
    const data: CloudChatResponse = await response.json();
    if (data.error || !data.reply) {
      throw new Error(data.error || "Chat response contained no reply");
    }
    // Defensive: strip thinking blocks again even though the server route
    // already does this, so a bug on either side can never leak reasoning to
    // the patient.
    return { text: stripThinking(data.reply) };
  } catch (error) {
    console.warn("Chat request to the cloud API failed:", error);
    return { text: "Sorry, I'm having trouble responding right now. If this feels urgent, please contact a health worker." };
  }
}
