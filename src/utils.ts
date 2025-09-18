export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: `performance_metric${metadata?.label ? `-${metadata.label}` : ""}`,
    preparedAt: performance.now(),
    ...metric,
    ...(metadata ?? {})
  };
};

export const markUserTimingStart = (id: string) => {
  performance.mark(`${id}-start`);
};

export const markUserTimingEnding = (id: string) => {
  performance.mark(`${id}-end`);
  performance.measure(`${id}-duration`, `${id}-start`, `${id}-end`);
};
