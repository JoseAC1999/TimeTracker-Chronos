function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAuthSecret() {
  return getRequiredEnv("NEXTAUTH_SECRET");
}

export function getAppUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getRateLimitDriver() {
  return process.env.RATE_LIMIT_DRIVER === "database" ? "database" : "memory";
}

export function getObservabilitySinkConfig() {
  return {
    url: process.env.OBSERVABILITY_SINK_URL,
    token: process.env.OBSERVABILITY_SINK_TOKEN,
    timeoutMs: Number(process.env.OBSERVABILITY_SINK_TIMEOUT_MS || 2000),
  };
}
