// ─── In-process store ────────────────────────────────────────────────────────
// Works well for single-instance Vercel Hobby / single-region deployments.
// For multi-region, swap the Maps for Redis (Upstash) — same interface.

import type { AIAnalysis } from "@/types";

// ─── Rate limiter ─────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_CONFIG = {
  // Max AI calls per user per window
  analyze: { maxRequests: 20, windowMs: 60 * 60 * 1000 },  // 20/hour
  chat:    { maxRequests: 40, windowMs: 60 * 60 * 1000 },  // 40/hour
} as const;

export type RateLimitedAction = keyof typeof RATE_LIMIT_CONFIG;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Check + increment rate limit for a given (userId, action) pair.
 * Returns whether the request is allowed and diagnostic info.
 */
export function checkRateLimit(
  userId: string,
  action: RateLimitedAction
): RateLimitResult {
  const cfg = RATE_LIMIT_CONFIG[action];
  const key = `${userId}:${action}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // First request or window has expired — reset
  if (!entry || now - entry.windowStart > cfg.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: cfg.maxRequests - 1, resetInMs: cfg.windowMs };
  }

  if (entry.count >= cfg.maxRequests) {
    const resetInMs = cfg.windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, resetInMs };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: cfg.maxRequests - entry.count,
    resetInMs: cfg.windowMs - (now - entry.windowStart),
  };
}

// ─── Analysis cache ───────────────────────────────────────────────────────────

interface CacheEntry {
  analysis: AIAnalysis;
  cachedAt: number;
}

const analysisCache = new Map<string, CacheEntry>();

// Cache TTL: 24 hours — analysis for the same playlist snapshot won't change
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Key includes snapshotId so the cache is automatically invalidated
 * whenever the playlist changes (tracks added/removed).
 */
export function getCachedAnalysis(
  playlistId: string,
  snapshotId: string
): AIAnalysis | null {
  const key = `${playlistId}:${snapshotId}`;
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    analysisCache.delete(key);
    return null;
  }
  return entry.analysis;
}

export function setCachedAnalysis(
  playlistId: string,
  snapshotId: string,
  analysis: AIAnalysis
): void {
  const key = `${playlistId}:${snapshotId}`;
  analysisCache.set(key, { analysis, cachedAt: Date.now() });
}

// ─── Cleanup (prevent unbounded growth) ──────────────────────────────────────
// Purge stale entries every hour. In serverless environments this runs
// only while the function is warm, which is fine for our use case.

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Array.from(analysisCache.entries()).forEach(([key, entry]) => {
      if (now - entry.cachedAt > CACHE_TTL_MS) analysisCache.delete(key);
    });
    Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
      const action = key.split(":")[1] as RateLimitedAction;
      const cfg = RATE_LIMIT_CONFIG[action];
      if (cfg && now - entry.windowStart > cfg.windowMs) rateLimitStore.delete(key);
    });
  }, 60 * 60 * 1000);
}
