export const filterObjectFields = (source: Record<string, any>, allowedKeys?: string[]): Record<string, any> => {
  if (!allowedKeys || allowedKeys.length === 0) {
    return { ...source };
  }

  return Object.keys(source).reduce<Record<string, any>>((acc, key) => {
    if (allowedKeys.includes(key)) acc[key] = source[key];
    return acc;
  }, {});
};
