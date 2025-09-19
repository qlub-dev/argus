export const checkValueWithinBounds = (value: number, lowerBound?: number, upperBound?: number): boolean => {
  console.log("argus bound check 1 val ", value, " lb ", lowerBound, " ub ", upperBound);
  if (lowerBound !== undefined && value < lowerBound) return false;
  console.log("argus bound check 2 val ", value, " lb ", lowerBound, " ub ", upperBound);
  if (upperBound !== undefined && value > upperBound) return false;
  console.log("argus bound check 3 val ", value, " lb ", lowerBound, " ub ", upperBound);
  return true;
};
