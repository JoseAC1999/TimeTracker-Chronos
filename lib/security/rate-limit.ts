import { prisma } from "@/lib/db/prisma";
import { getRateLimitDriver } from "@/lib/env";
import { logger } from "@/lib/observability/logger";

type RateLimitEntry = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

const globalStore = globalThis as unknown as {
  authRateLimitStore?: Map<string, RateLimitEntry>;
};

const store = globalStore.authRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalStore.authRateLimitStore) {
  globalStore.authRateLimitStore = store;
}

function pruneExpired(now: number) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now && (!value.blockedUntil || value.blockedUntil <= now)) {
      store.delete(key);
    }
  }
}

async function consumeInMemory(
  key: string,
  {
    limit,
    windowMs,
    blockMs,
  }: {
    limit: number;
    windowMs: number;
    blockMs: number;
  },
) {
  const now = Date.now();
  pruneExpired(now);

  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { allowed: true, retryAfterSec: 0 };
  }

  if (current.blockedUntil && current.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((current.blockedUntil - now) / 1000),
    };
  }

  current.count += 1;

  if (current.count > limit) {
    current.blockedUntil = now + blockMs;
    store.set(key, current);

    return {
      allowed: false,
      retryAfterSec: Math.ceil(blockMs / 1000),
    };
  }

  store.set(key, current);

  return { allowed: true, retryAfterSec: 0 };
}

async function consumeInDatabase(
  key: string,
  {
    limit,
    windowMs,
    blockMs,
  }: {
    limit: number;
    windowMs: number;
    blockMs: number;
  },
) {
  const now = new Date();
  const nowMs = now.getTime();
  const resetAt = new Date(nowMs + windowMs);

  const current = await prisma.rateLimitBucket.findUnique({
    where: { key },
  });

  if (!current || current.resetAt.getTime() <= nowMs) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: {
        key,
        count: 1,
        resetAt,
      },
      update: {
        count: 1,
        resetAt,
        blockedUntil: null,
      },
    });

    return { allowed: true, retryAfterSec: 0 };
  }

  if (current.blockedUntil && current.blockedUntil.getTime() > nowMs) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((current.blockedUntil.getTime() - nowMs) / 1000),
    };
  }

  const nextCount = current.count + 1;
  const blockedUntil = nextCount > limit ? new Date(nowMs + blockMs) : null;

  await prisma.rateLimitBucket.update({
    where: { key },
    data: {
      count: nextCount,
      blockedUntil,
    },
  });

  if (blockedUntil) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(blockMs / 1000),
    };
  }

  return { allowed: true, retryAfterSec: 0 };
}

export async function consumeRateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
    blockMs: number;
  },
) {
  if (getRateLimitDriver() === "database") {
    try {
      return await consumeInDatabase(key, options);
    } catch (error) {
      logger.warn({
        event: "security.rate_limit.database_fallback",
        message: error instanceof Error ? error.message : "Database rate limit failed",
        context: { key },
      });
    }
  }

  return consumeInMemory(key, options);
}

export async function resetRateLimit(key: string) {
  store.delete(key);
  if (getRateLimitDriver() === "database") {
    try {
      await prisma.rateLimitBucket.delete({
        where: { key },
      });
    } catch {
      // ignore when key does not exist
    }
  }
}

function readHeader(headersLike: Headers | Record<string, unknown> | undefined, key: string) {
  if (!headersLike) return null;
  if (headersLike instanceof Headers) {
    return headersLike.get(key);
  }

  const value = headersLike[key] ?? headersLike[key.toLowerCase()];
  return typeof value === "string" ? value : null;
}

export function getClientIp(headersLike: Headers | Record<string, unknown> | undefined) {
  const forwardedFor = readHeader(headersLike, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return readHeader(headersLike, "x-real-ip") ?? "unknown";
}
