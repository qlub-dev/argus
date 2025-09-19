import { filterObjectFields } from "./lib/filter-object-fields";

export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>, filterKeys?: string[]) => {
  const enhancedMetric = {
    agent: "argus",
    event: `performance_metric${metadata?.label ? `-${metadata.label}` : ""}`,
    preparedAt: performance.now(),
    argusMetricType: metadata?.type,
    ...metric,
    ...(metadata ?? {})
  };

  return filterObjectFields(enhancedMetric, filterKeys);
};

export const markUserTimingStart = (id: string) => {
  performance.mark(`${id}-start`);
};

export const markUserTimingEnding = (id: string) => {
  const startMarkId = `${id}-start`;
  if (!(performance.getEntriesByName(startMarkId).length > 0)) return;

  performance.mark(`${id}-end`);
  performance.measure(`${id}-duration`, startMarkId, `${id}-end`);
};
