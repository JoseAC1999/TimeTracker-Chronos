const globalMetrics = globalThis as unknown as {
  appMetrics?: Map<string, number>;
};

const metrics = globalMetrics.appMetrics ?? new Map<string, number>();

if (!globalMetrics.appMetrics) {
  globalMetrics.appMetrics = metrics;
}

export function incrementMetric(name: string, value = 1) {
  metrics.set(name, (metrics.get(name) ?? 0) + value);
}

export function getMetric(name: string) {
  return metrics.get(name) ?? 0;
}
