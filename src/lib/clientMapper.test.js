import { describe, it, expect } from "vitest";
import { mapDbClientToUi } from "./clientMapper.js";

const seed = {
  sessions: [{ day: "MON", label: "Push" }],
  stats: { calories: 2100, protein: 185, steps: 9000, sleep: 7, water: 2.5 },
  measurements: { chest: 100, waist: 80, hips: 95, arms: 35, thighs: 55 },
  weightHistory: [102, 95, 90],
};

describe("mapDbClientToUi", () => {
  it("maps database fields to UI shape", () => {
    const ui = mapDbClientToUi({
      id: "uuid-1",
      thread_id: "jordan-blake",
      name: "Jordan Blake",
      avatar: "JB",
      goal: "Fat Loss",
      phase: "Cut",
      accent_color: "#FF4D00",
      watch: "Apple Watch",
      connected: true,
      weight: 89.4,
      start_weight: 102,
      target_weight: 78,
      body_fat: 24.1,
      start_body_fat: 31,
      target_body_fat: 15,
      week_num: 8,
      total_weeks: 16,
      compliance: 91,
      streak: 12,
    }, seed);

    expect(ui.name).toBe("Jordan Blake");
    expect(ui.thread_id).toBe("jordan-blake");
    expect(ui.accent).toBe("#FF4D00");
    expect(ui.weekNum).toBe(8);
    expect(ui.sessions).toEqual(seed.sessions);
    expect(ui.weightHistory).toEqual(seed.weightHistory);
  });

  it("uses defaults when seed data is absent", () => {
    const ui = mapDbClientToUi({
      id: "uuid-2",
      thread_id: "new-client",
      name: "New Client",
    });

    expect(ui.avatar).toBe("?");
    expect(ui.goal).toBe("Fat Loss");
    expect(ui.sessions).toEqual([]);
    expect(ui.weightHistory).toEqual([0]);
  });
});
