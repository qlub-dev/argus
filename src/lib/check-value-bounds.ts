export const checkValueWithinBounds = (value: number, lowerBound?: number, upperBound?: number): boolean => {
  if (lowerBound !== undefined && value < lowerBound) return false;
  if (upperBound !== undefined && value > upperBound) return false;
  return true;
};
