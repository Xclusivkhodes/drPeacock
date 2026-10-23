import { buildFallbackBaseline } from "./healthBaseline";
import type { UserProfile } from "./types";

const profile: UserProfile = {
  name: "Kojo",
  age: 28,
  city: "Kumasi",
  heightCm: 180,
  weightKg: 75,
  allergies: ["Sulfa"],
  conditions: ["Asthma"],
  pregnancy: "No",
  family: ["Diabetes"],
  sleep: "Under 5h",
};

describe("buildFallbackBaseline", () => {
  it("always includes a dose card and a local malaria note", () => {
    const cards = buildFallbackBaseline(profile);
    expect(cards.map((card) => card.title)).toEqual(
      expect.arrayContaining(["Doses sized to you", "Local risk added"]),
    );
    expect(cards.find((card) => card.title === "Local risk added")?.desc).toContain("Kumasi");
  });

  it("folds allergies, conditions, family history, and short sleep into the offline cards", () => {
    const titles = buildFallbackBaseline(profile).map((card) => card.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Conditions read into every check",
        "Never suggested to you",
        "Screening brought forward",
        "Short sleep noted",
      ]),
    );
  });

  it("skips the pregnancy card when the patient is not pregnant", () => {
    const titles = buildFallbackBaseline(profile).map((card) => card.title);
    expect(titles).not.toContain("Pregnancy-safe only");
  });
});
