import { getObservabilitySinkConfig } from "@/lib/env";

type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  event: string;
  message: string;
  context?: Record<string, unknown>;
};

function redact(context?: Record<string, unknown>) {
  if (!context) return undefined;

  const redactedEntries = Object.entries(context).map(([key, value]) => {
    const lowered = key.toLowerCase();
    if (lowered.includes("password") || lowered.includes("secret") || lowered.includes("token") || lowered.includes("hash")) {
      return [key, "[REDACTED]"];
    }

    return [key, value];
  });

  return Object.fromEntries(redactedEntries);
}

function write(level: LogLevel, payload: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event: payload.event,
    message: payload.message,
    context: redact(payload.context),
  };

  const line = JSON.stringify(entry);
  const sinkConfig = getObservabilitySinkConfig();
  if (sinkConfig.url) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sinkConfig.url);
    } catch {
      console.error("[logger] Invalid OBSERVABILITY_SINK_URL — skipping remote sink");
      parsedUrl = null as unknown as URL;
    }

    if (parsedUrl && (parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:")) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), sinkConfig.timeoutMs);
      fetch(parsedUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sinkConfig.token ? { Authorization: `Bearer ${sinkConfig.token}` } : {}),
        },
        body: line,
        signal: controller.signal,
      })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[logger] Failed to send to observability sink:", message);
        })
        .finally(() => {
          clearTimeout(timer);
        });
    }
  }

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info(payload: LogPayload) {
    write("info", payload);
  },
  warn(payload: LogPayload) {
    write("warn", payload);
  },
  error(payload: LogPayload) {
    write("error", payload);
  },
};
