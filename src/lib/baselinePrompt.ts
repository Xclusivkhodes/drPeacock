import type { BaselineCard, UserProfile } from "@/data/types";
import { formatList } from "@/lib/chatPrompt";

/**
 * Pure prompt-building/parsing logic for health-baseline generation, used
 * only by the server-side app/api/baseline+api.ts route. Kept dependency-free
 * (no fetch, no client stores) so it stays trivially testable and safe to
 * import from a Node.js API route.
 */
const REQUIRED_CATEGORIES = [
  "Doses sized to you",
  "Conditions read into every check",
  "Never suggested to you",
  "Screening brought forward",
  "Local risk added",
];

export function buildUserDataSummary(profile: UserProfile, language: string): string {
  return [
    `Name: ${profile.name || "Unknown"}`,
    `Age: ${profile.age || "Unknown"}`,
    `Location: ${profile.city || "Unknown"}`,
    `Sex at birth: ${profile.sex ?? "Not provided"}`,
    `Height: ${profile.heightCm ? `${profile.heightCm} cm` : "Not provided"}`,
    `Weight: ${profile.weightKg ? `${profile.weightKg} kg` : "Not provided"}`,
    `Blood group: ${profile.bloodGroup ?? "Not provided"}`,
    `Ongoing conditions: ${formatList(profile.conditions)}`,
    `Pregnancy/breastfeeding: ${profile.pregnancy ?? "Not provided"}`,
    `Allergies: ${formatList(profile.allergies)}`,
    `Current medicines: ${profile.meds || "None reported"}`,
    `Smoking: ${profile.smoking ?? "Not provided"}`,
    `Alcohol: ${profile.alcohol ?? "Not provided"}`,
    `Activity level: ${profile.activity ?? "Not provided"}`,
    `Sleep: ${profile.sleep ?? "Not provided"}`,
    `Family history: ${formatList(profile.family)}`,
    `Preferred language: ${language}`,
  ].join("\n");
}

/**
 * Five-"S" system prompt: Scene (persona), Specify (task/context),
 * Structure (output shape), State (tone), Supply (constraints).
 */
export function buildBaselineSystemPrompt(): string {
  return `You are Dr. Peacock, a compassionate and expert clinical AI health assistant for a mobile app used across Ghana and Africa.

TASK: Analyze the patient data you are given and establish a personalized health baseline — a short set of cards explaining what you now know about this patient and how it changes your guidance going forward.

OUTPUT FORMAT: Respond with ONLY a JSON array, no text before or after it, no markdown code fences. Each element is an object with exactly two string fields: "title" (a short heading) and "desc" (one to two sentences).
Include one card for each of these categories, adapted to this specific patient (you may omit a category only if it is genuinely not applicable, e.g. skip "Screening brought forward" if no family history was reported):
${REQUIRED_CATEGORIES.map((c) => `- ${c}`).join("\n")}
Beyond those, generate additional cards for any other general medical knowledge, preventative care, or lifestyle advice that is clearly relevant to this specific patient's profile.

TONE: Write for a reader with no medical background. Plain, warm, patient-friendly language. Avoid clinical jargon; if you must use a medical term, explain it in the same sentence.

CONSTRAINTS:
- Never recommend or imply an off-label use of any medication.
- Never state or imply this replaces a doctor — you are a guidance assistant only.
- Base every card strictly on the data provided; do not invent conditions, medications, or history the patient did not report.`;
}

export function parseBaselineCards(raw: string): BaselineCard[] {
  const match = raw.match(/\[[\s\S]*\]/);
  const jsonText = match ? match[0] : raw;
  const parsed: unknown = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) {
    throw new Error("NVIDIA API response was not a JSON array");
  }
  const cards = parsed
    .filter(
      (item): item is BaselineCard =>
        typeof item === "object" && item !== null && typeof (item as BaselineCard).title === "string" && typeof (item as BaselineCard).desc === "string"
    )
    .map((item) => ({ title: item.title.trim(), desc: item.desc.trim() }));
  if (!cards.length) {
    throw new Error("NVIDIA API response contained no valid cards");
  }
  return cards;
}
