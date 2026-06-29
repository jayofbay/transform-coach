export function sortProgressLogs(logs, direction = "asc") {
  const sorted = [...logs].sort((a, b) => {
    const dateCmp = (a.logged_date || "").localeCompare(b.logged_date || "");
    if (dateCmp !== 0) return dateCmp;
    return (a.created_at || "").localeCompare(b.created_at || "");
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function buildBodyStatsFromLogs(client, progressLogs) {
  const sortedAsc = sortProgressLogs(progressLogs, "asc");
  const sortedDesc = sortProgressLogs(progressLogs, "desc");
  const latestLog = sortedDesc[0] || null;
  const logWeights = sortedAsc.map((log) => log.weight_kg).filter((weight) => weight != null);

  let weightHistory = client.weightHistory;
  if (logWeights.length === 1) {
    weightHistory = [client.startWeight, logWeights[0]];
  } else if (logWeights.length > 1) {
    weightHistory = [client.startWeight, ...logWeights];
  }

  return {
    currentWeight: latestLog?.weight_kg ?? client.weight,
    currentBodyFat: latestLog?.body_fat_pct ?? client.bodyFat,
    weightHistory,
    recentLogs: sortedDesc,
  };
}

export function calcWeightProgressPct(currentWeight, startWeight, targetWeight) {
  if (targetWeight === startWeight) return 0;
  return Math.round(((currentWeight - startWeight) / (targetWeight - startWeight)) * 100);
}
