const DEFAULT_SESSIONS = [];
const DEFAULT_STATS = { calories: 0, protein: 0, steps: 0, sleep: 0, water: 0 };
const DEFAULT_MEASUREMENTS = { chest: 0, waist: 0, hips: 0, arms: 0, thighs: 0 };

export function mapDbClientToUi(row, seed = null) {
  return {
    id: row.id,
    thread_id: row.thread_id,
    name: row.name,
    avatar: row.avatar || "?",
    goal: row.goal || "Fat Loss",
    phase: row.phase || "Cut",
    accent: row.accent_color || "#FF4D00",
    watch: row.watch || null,
    connected: row.connected || false,
    weight: row.weight || 0,
    startWeight: row.start_weight || 0,
    targetWeight: row.target_weight || 0,
    bodyFat: row.body_fat || 0,
    startBodyFat: row.start_body_fat || 0,
    targetBodyFat: row.target_body_fat || 0,
    weekNum: row.week_num || 1,
    totalWeeks: row.total_weeks || 16,
    compliance: row.compliance || 0,
    streak: row.streak || 0,
    sessions: seed?.sessions ?? DEFAULT_SESSIONS,
    stats: seed?.stats ?? DEFAULT_STATS,
    measurements: seed?.measurements ?? DEFAULT_MEASUREMENTS,
    weightHistory: seed?.weightHistory ?? [row.weight || 0],
  };
}
