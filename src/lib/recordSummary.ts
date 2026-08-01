import type { UserProfile } from "@/data/types";

export function formatList(items?: string[], emptyLabel = "None known"): string {
  const cleaned = (items ?? []).filter((item) => !item.startsWith("None"));
  return cleaned.length ? cleaned.join(", ") : emptyLabel;
}

export function calculateBmi(heightCm?: number, weightKg?: number): string | null {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

/**
 * Formats the patient's on-device health profile into a plain-text summary
 * for the native share sheet — no backend, no cloud copy, just a snapshot of
 * what's already in the Zustand store at the moment "Share" is tapped.
 */
export function buildRecordSummary(profile: UserProfile | null, language: string): string {
  if (!profile) return "No health record available yet.";

  const bmi = calculateBmi(profile.heightCm, profile.weightKg);
  const vitals = [
    profile.heightCm ? `${profile.heightCm} cm` : null,
    profile.weightKg ? `${profile.weightKg} kg` : null,
    bmi ? `BMI ${bmi}` : null,
    profile.bloodGroup ? `blood ${profile.bloodGroup}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const lifestyle = [
    profile.smoking ? `${profile.smoking} smoking` : null,
    profile.alcohol ? `${profile.alcohol} alcohol` : null,
    profile.activity,
    profile.sleep ? `${profile.sleep} sleep` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return [
    `${profile.name}'s Health Record — Dr. Peacock`,
    "",
    `Age: ${profile.age || "Not provided"}`,
    `Sex at birth: ${profile.sex ?? "Not provided"}`,
    `City: ${profile.city || "Not provided"}`,
    "",
    `Allergies: ${formatList(profile.allergies)}`,
    `Existing conditions: ${formatList(profile.conditions)}`,
    `Medications: ${profile.meds || "None recorded"}`,
    `Body & vitals: ${vitals || "Not provided"}`,
    `Lifestyle: ${lifestyle || "Not provided"}`,
    `Family history: ${formatList(profile.family)}`,
    `Recent visits: ${profile.recentVisits || "None recorded"}`,
    `Languages: ${language} · Twi`,
    "",
    "Shared via Dr. Peacock — this is guidance only and does not replace a doctor.",
  ].join("\n");
}
