import test from "node:test";
import assert from "node:assert/strict";

import { consumeRateLimit, getClientIp, resetRateLimit } from "@/lib/security/rate-limit";

test("getClientIp reads forwarded headers safely", () => {
  const ip = getClientIp({
    "x-forwarded-for": "203.0.113.10, 10.0.0.2",
  });

  assert.equal(ip, "203.0.113.10");
});

test("rate limit blocks after threshold and can be reset", async () => {
  const key = `test-login-${Date.now()}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await consumeRateLimit(key, {
      limit: 3,
      windowMs: 60_000,
      blockMs: 60_000,
    });

    assert.equal(result.allowed, true);
  }

  const blocked = await consumeRateLimit(key, {
    limit: 3,
    windowMs: 60_000,
    blockMs: 60_000,
  });

  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec > 0);

  await resetRateLimit(key);

  const afterReset = await consumeRateLimit(key, {
    limit: 3,
    windowMs: 60_000,
    blockMs: 60_000,
  });

  assert.equal(afterReset.allowed, true);
});
