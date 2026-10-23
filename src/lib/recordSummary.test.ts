import type { UserProfile } from "@/data/types";

import { buildRecordSummary, calculateBmi, formatList } from "./recordSummary";

const profile: UserProfile = {
  name: "Ama Mensah",
  age: 34,
  city: "Accra",
  heightCm: 170,
  weightKg: 68,
  bloodGroup: "O+",
  allergies: ["None", "Penicillin"],
  conditions: [],
  meds: "",
  smoking: "Never",
  alcohol: "Occasionally",
  activity: "Walks daily",
  sleep: "7 hours",
  family: ["None known"],
};

describe("formatList", () => {
  it("drops placeholder none entries and joins the rest", () => {
    expect(formatList(["None", "Penicillin"])).toBe("Penicillin");
  });

  it("uses the empty label when every entry is a none placeholder", () => {
    expect(formatList(["None known"])).toBe("None known");
    expect(formatList(undefined, "Not recorded")).toBe("Not recorded");
  });
});

describe("calculateBmi", () => {
  it("returns a one-decimal BMI", () => {
    expect(calculateBmi(170, 68)).toBe("23.5");
  });

  it("returns null when height or weight is missing", () => {
    expect(calculateBmi(undefined, 68)).toBeNull();
    expect(calculateBmi(0, 68)).toBeNull();
    expect(calculateBmi(170, 0)).toBeNull();
  });
});

describe("buildRecordSummary", () => {
  it("explains that no record exists yet", () => {
    expect(buildRecordSummary(null, "English")).toBe("No health record available yet.");
  });

  it("includes the profile, calculated BMI, and the doctor disclaimer", () => {
    const summary = buildRecordSummary(profile, "English");
    expect(summary).toContain("Ama Mensah's Health Record — Dr. Peacock");
    expect(summary).toContain("Age: 34");
    expect(summary).toContain("City: Accra");
    expect(summary).toContain("Allergies: Penicillin");
    expect(summary).toContain("BMI 23.5");
    expect(summary).toContain("Languages: English · Twi");
    expect(summary).toContain("does not replace a doctor");
  });
});
