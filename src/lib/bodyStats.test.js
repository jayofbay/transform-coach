import { describe, it, expect } from "vitest";
import {
  sortProgressLogs,
  buildBodyStatsFromLogs,
  calcWeightProgressPct,
} from "./bodyStats.js";

const baseClient = {
  weight: 90,
  bodyFat: 24,
  startWeight: 102,
  targetWeight: 78,
  weightHistory: [102, 100, 98, 96, 94, 92, 90],
};

describe("sortProgressLogs", () => {
  it("sorts by logged_date ascending", () => {
    const logs = [
      { id: "2", logged_date: "2026-03-10", created_at: "2026-03-10T10:00:00Z" },
      { id: "1", logged_date: "2026-03-01", created_at: "2026-03-01T10:00:00Z" },
    ];
    expect(sortProgressLogs(logs).map((log) => log.id)).toEqual(["1", "2"]);
  });

  it("sorts by created_at when dates match", () => {
    const logs = [
      { id: "2", logged_date: "2026-03-10", created_at: "2026-03-10T12:00:00Z" },
      { id: "1", logged_date: "2026-03-10", created_at: "2026-03-10T08:00:00Z" },
    ];
    expect(sortProgressLogs(logs).map((log) => log.id)).toEqual(["1", "2"]);
  });

  it("sorts descending when requested", () => {
    const logs = [
      { id: "1", logged_date: "2026-03-01", created_at: "2026-03-01T10:00:00Z" },
      { id: "2", logged_date: "2026-03-10", created_at: "2026-03-10T10:00:00Z" },
    ];
    expect(sortProgressLogs(logs, "desc").map((log) => log.id)).toEqual(["2", "1"]);
  });
});

describe("buildBodyStatsFromLogs", () => {
  it("falls back to client seed data when no logs exist", () => {
    const stats = buildBodyStatsFromLogs(baseClient, []);
    expect(stats.currentWeight).toBe(90);
    expect(stats.currentBodyFat).toBe(24);
    expect(stats.weightHistory).toEqual(baseClient.weightHistory);
    expect(stats.recentLogs).toEqual([]);
  });

  it("uses latest log for current weight and body fat", () => {
    const logs = [
      { id: "1", logged_date: "2026-03-01", created_at: "2026-03-01T10:00:00Z", weight_kg: 88, body_fat_pct: 22 },
      { id: "2", logged_date: "2026-03-10", created_at: "2026-03-10T10:00:00Z", weight_kg: 86, body_fat_pct: 21 },
    ];
    const stats = buildBodyStatsFromLogs(baseClient, logs);
    expect(stats.currentWeight).toBe(86);
    expect(stats.currentBodyFat).toBe(21);
    expect(stats.recentLogs[0].id).toBe("2");
  });

  it("builds two-point chart history for a single log", () => {
    const logs = [
      { id: "1", logged_date: "2026-03-01", created_at: "2026-03-01T10:00:00Z", weight_kg: 88 },
    ];
    const stats = buildBodyStatsFromLogs(baseClient, logs);
    expect(stats.weightHistory).toEqual([102, 88]);
  });

  it("builds multi-point chart history from multiple logs", () => {
    const logs = [
      { id: "1", logged_date: "2026-03-01", created_at: "2026-03-01T10:00:00Z", weight_kg: 95 },
      { id: "2", logged_date: "2026-03-10", created_at: "2026-03-10T10:00:00Z", weight_kg: 90 },
      { id: "3", logged_date: "2026-03-20", created_at: "2026-03-20T10:00:00Z", weight_kg: 86 },
    ];
    const stats = buildBodyStatsFromLogs(baseClient, logs);
    expect(stats.weightHistory).toEqual([102, 95, 90, 86]);
  });
});

describe("calcWeightProgressPct", () => {
  it("calculates progress toward target", () => {
    expect(calcWeightProgressPct(90, 102, 78)).toBe(50);
  });

  it("returns 0 when start and target are equal", () => {
    expect(calcWeightProgressPct(90, 90, 90)).toBe(0);
  });
});
