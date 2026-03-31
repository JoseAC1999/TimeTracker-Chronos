import { logger } from "@/lib/observability/logger";
import { incrementMetric } from "@/lib/observability/metrics";

export function captureError(error: unknown, event: string, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : "Unknown error";

  incrementMetric(`error.${event}`);
  logger.error({
    event,
    message,
    context: {
      ...context,
      stack: error instanceof Error ? error.stack : undefined,
    },
  });
}
