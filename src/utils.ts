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
  console.log("Argus: mark start id ", id);
  performance.mark(`${id}-start`);
};

export const markUserTimingEnding = (id: string) => {
  console.log("Argus: mark end id ", id);
  performance.mark(`${id}-end`);
  performance.measure(`${id}-duration`, `${id}-start`, `${id}-end`);
};
