import { filterObjectFields } from "./lib/filter-object-fields";

export const prepareMetric = (metric: Record<string, any>, metadata?: Record<string, any>, filterKeys?: string[]) => {
  // Web-vitals attribution metrics carry an extra nested `attribution` object. Flatten its
  // fields onto the top level so they're individually selectable via `filterKeys`, since
  // `filterObjectFields` only filters top-level keys. No-op for metrics without this field.
  const { attribution, ...restMetric } = metric;
  const flattenedAttribution = attribution && typeof attribution === "object" ? attribution : {};

  const enhancedMetric = {
    agent: "argus",
    event: `perf${metadata?.type ? `-${metadata.type}` : ""}${metadata?.label ? `-${metadata.label}` : ""}`,
    preparedAt: performance.now(),
    argusMetricType: metadata?.type,
    ...restMetric,
    ...flattenedAttribution,
    ...(metadata ?? {})
  };

  return filterObjectFields(enhancedMetric, filterKeys);
};

export const markUserTimingStart = (id: string) => {
  performance.mark(`${id}-start`);
};

export const markUserTimingEnd = (id: string) => {
  const startMarkId = `${id}-start`;
  if (!(performance.getEntriesByName(startMarkId).length > 0)) return;

  performance.mark(`${id}-end`);
  performance.measure(`${id}-duration`, startMarkId, `${id}-end`);
};
