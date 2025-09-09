export const evaluateSamplingChance = (rate: number): boolean => {
  if (rate <= 0) return false;
  if (rate >= 1) return true;
  return Math.random() < rate;
};
