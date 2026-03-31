import test from "node:test";
import assert from "node:assert/strict";

import { registerSchema } from "@/lib/validations/auth";

test("register schema accepts strong passwords", () => {
  const parsed = registerSchema.safeParse({
    name: "Jose",
    email: "jose@example.com",
    password: "SecurePass123",
  });

  assert.equal(parsed.success, true);
});

test("register schema rejects weak passwords", () => {
  const parsed = registerSchema.safeParse({
    name: "Jose",
    email: "jose@example.com",
    password: "12345678",
  });

  assert.equal(parsed.success, false);
});
