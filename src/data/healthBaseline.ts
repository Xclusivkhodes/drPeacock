import type { BaselineCard, UserProfile } from "@/data/types";

function withoutNone(list: string[] = []): string[] {
  return list.filter((item) => !item.startsWith("None"));
}

function getBmiBand(bmi: number): string {
  if (bmi < 18.5) return "Below healthy range";
  if (bmi < 25) return "Healthy range";
  if (bmi < 30) return "Above healthy range";
  return "High — worth a check";
}

/**
 * Offline baseline generator — used the instant onboarding finishes (before
 * Gemma responds) and as the fallback if on-device generation fails. Mirrors
 * the tailored-items logic from the original design prototype.
 */
export function buildFallbackBaseline(profile: UserProfile): BaselineCard[] {
  const heightCm = profile.heightCm ?? 164;
  const weightKg = profile.weightKg ?? 62;
  const bmi = weightKg / Math.pow(heightCm / 100, 2);

  const items: BaselineCard[] = [
    {
      title: "Doses sized to you",
      desc: `${heightCm} cm · ${weightKg} kg · BMI ${bmi.toFixed(1)} (${getBmiBand(bmi).toLowerCase()}). I flag doses that do not fit your build.`,
    },
  ];

  const conditions = withoutNone(profile.conditions);
  if (conditions.length) {
    items.push({
      title: "Conditions read into every check",
      desc: `${conditions.join(", ")} — I weigh these on every symptom check and remind you to tell the clinic.`,
    });
  }

  const allergies = withoutNone(profile.allergies);
  if (allergies.length) {
    items.push({ title: "Never suggested to you", desc: `${allergies.join(", ")} is filtered out of every medicine I mention.` });
  }

  if (profile.pregnancy && profile.pregnancy !== "No" && profile.pregnancy !== "Not sure") {
    items.push({
      title: "Pregnancy-safe only",
      desc: `Every suggestion is screened for ${profile.pregnancy.toLowerCase()} safety, and maternity care is ranked first.`,
    });
  }

  const family = withoutNone(profile.family);
  if (family.length) {
    items.push({
      title: "Screening brought forward",
      desc: `Family history of ${family.join(", ")} — I will nudge you for checks earlier than average.`,
    });
  }

  items.push({
    title: "Local risk added",
    desc: `Malaria is in season around ${profile.city || "your area"}. Fever gets a faster route to testing for you.`,
  });

  if (profile.sleep === "Under 5h" || profile.sleep === "5–6h") {
    items.push({
      title: "Short sleep noted",
      desc: `Headaches and fatigue get read against ${profile.sleep.toLowerCase()} of sleep before I call them a symptom.`,
    });
  }

  return items;
}
