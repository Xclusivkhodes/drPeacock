import type { FollowUpQuestion } from "@/data/types";

export const SYMPTOMS: string[] = [
  "Fever",
  "Headache",
  "Chills",
  "Cough",
  "Chest pain",
  "Stomach pain",
  "Rash",
  "Difficulty breathing",
  "Vomiting",
  "Fatigue",
];

export const FOLLOW_UP_QUESTIONS: FollowUpQuestion[] = [
  {
    key: "onset",
    label: "When did it start?",
    options: ["Today", "2-3 days ago", "Over a week"],
  },
  {
    key: "severity",
    label: "How severe is it?",
    options: ["Mild", "Uncomfortable", "Severe"],
  },
  {
    key: "history",
    label: "Any existing conditions?",
    options: ["Asthma", "Pregnant", "Diabetes", "None"],
  },
];
