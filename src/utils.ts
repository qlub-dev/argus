export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: `performance_metric${metadata?.label ? `-${metadata.label}` : ""}`,
    preparedAt: performance.now(),
    ...metric,
    ...(metadata ?? {})
  };
};
