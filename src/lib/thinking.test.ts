import { stripThinking } from "./thinking";

describe("stripThinking", () => {
  it("returns the answer when the model did not think", () => {
    expect(stripThinking("  Drink water and rest.  ")).toBe("Drink water and rest.");
  });

  it("removes gemma think tags before the answer is shown", () => {
    const raw = "Hello <|think|>private reasoning<|/think|> drink water.";
    expect(stripThinking(raw)).toBe("Hello  drink water.");
    expect(stripThinking(raw)).not.toContain("private reasoning");
  });

  it("removes xml think tags", () => {
    expect(stripThinking("<think>hidden</think>See a clinician if it worsens.")).toBe(
      "See a clinician if it worsens.",
    );
  });

  it("removes channel thought blocks used by the gemma prompt", () => {
    const raw = "<|channel|>thought\nweigh malaria first<|message|>Go to a clinic today.";
    expect(stripThinking(raw)).toBe("Go to a clinic today.");
    expect(stripThinking("<|channel>thought hidden<|message|>Visible answer")).toBe(
      "Visible answer",
    );
  });
});
