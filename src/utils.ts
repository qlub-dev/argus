export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>) => {
  return {
    agent: "argus",
    event: `performance_metric${metadata?.label ? `-${metadata.label}` : ""}`,
    preparedAt: performance.now(),
    argusMetricType: metadata?.type,
    ...metric,
    ...(metadata ?? {})
  };
};

export const markUserTimingStart = (id: string) => {
  performance.mark(`${id}-start`);
};

export const markUserTimingEnding = (id: string) => {
  const startMarkId = `${id}-start`;
  if(!(performance.getEntriesByName(startMarkId).length > 0)) return

  performance.mark(`${id}-end`);
  performance.measure(`${id}-duration`, startMarkId, `${id}-end`);
};
