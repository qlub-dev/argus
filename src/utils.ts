export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: "performance_metric",
    preparedAt: performance.now(),
    ...metric,
    ...(metadata ?? {})
  };
};
