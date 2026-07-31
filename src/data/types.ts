export type Sex = "female" | "male" | "intersex" | "prefer_not_to_say";

export interface UserProfile {
  name: string;
  age: number;
  city: string;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  bloodGroup: string;
  conditions: string[];
  pregnancy: string;
  allergies: string[];
  meds: string;
  smoking: string;
  alcohol: string;
  activity: string;
  sleep: string;
  family: string[];
  consentStore: boolean;
  consentShare: boolean;
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
  type: CareType;
  score: string;
  distance: string;
  wait: string;
  cost: string;
  status: string;
  note: string;
}

export type RiskLevel = "low" | "moderate" | "high";

export interface ChatMessage {
  id: string;
  from: "ai" | "user";
  text?: string;
  attachmentUri?: string;
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
}
