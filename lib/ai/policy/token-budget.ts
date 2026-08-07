import { redis } from "@/lib/redis";

const DAILY_TOKEN_LIMIT = 5000;

export async function checkAndDeductTokenBudget(userId: string, estimatedTokens = 250) {
  const dateKey = new Date().toISOString().slice(0, 10);
  const tokenKey = `user:tokens:${userId}:${dateKey}`;

  const currentUsage = parseInt((await redis.get(tokenKey)) || "0", 10);

  if (currentUsage >= DAILY_TOKEN_LIMIT) {
    return {
      allowed: false,
      error: "Daily AI hint token limit reached. Try solving the rest independently!",
    };
  }

  // Record token usage and set 24h expiration
  await redis.incrby(tokenKey, estimatedTokens);
  await redis.expire(tokenKey, 86400);

  return { allowed: true, remaining: DAILY_TOKEN_LIMIT - (currentUsage + estimatedTokens) };
}