export function getCurrentStreak(prismaUser) {
  if (!prismaUser?.lastSubmissionDate) return 0;

  const now = new Date();
  const lastSub = new Date(prismaUser.lastSubmissionDate);

  // Normalize dates to YYYY-MM-DD format (UTC)
  const todayStr = now.toISOString().split("T")[0];
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const lastSubStr = lastSub.toISOString().split("T")[0];

  // If last submission was today or yesterday, streak is active
  if (lastSubStr === todayStr || lastSubStr === yesterdayStr) {
    return prismaUser.streak;
  }

  // Otherwise, streak is broken
  return 0;
}