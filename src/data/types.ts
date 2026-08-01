export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say";

export interface UserProfile {
  name: string;
  age: number;
  city: string;
  // Collected later by the health-profile builder (idea.md's "Personal Health
  // Profile" feature), not during initial account setup.
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  bloodGroup?: string;
  conditions?: string[];
  pregnancy?: string;
  allergies?: string[];
  meds?: string;
  smoking?: string;
  alcohol?: string;
  activity?: string;
  sleep?: string;
  family?: string[];
  consentStore?: boolean;
  consentShare?: boolean;
  /** Freeform note on past facility visits — no visit-tracking feature exists yet, so this is a simple editable field. */
  recentVisits?: string;
}

export type CareType =
  | "Emergency"
  | "General"
  | "Maternity"
  | "Children"
  | "Dental"
  | "Laboratory"
  | "Pharmacy";

export interface Facility {
  name: string;
  /** Descriptive subtype, e.g. "Polyclinic · Lab on site" — not the CareType category (that's the FACILITIES dict key it's grouped under). */
  type: string;
  score: string;
  distance: string;
  wait: string;
  cost: string;
  status: string;
  note: string;
  /** Real-world coordinates, needed to route to the Directions screen (app/directions.tsx). */
  latitude: number;
  longitude: number;
}

export type RiskLevel = "low" | "moderate" | "high";

export interface ChatMessage {
  id: string;
  from: "ai" | "user";
  text?: string;
  attachmentUri?: string;
  audioUri?: string;
  audioDurationMs?: number;
  createdAt: number;
}

export interface FollowUpQuestion {
  key: string;
  label: string;
  options: string[];
}

export interface SymptomCheckDraft {
  symptomText: string;
  selectedSymptoms: string[];
  answers: Record<string, string>;
  photoUri?: string;
}

export interface BaselineCard {
  title: string;
  desc: string;
}
