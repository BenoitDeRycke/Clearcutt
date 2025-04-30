export const getMarginColor = (margin: number): string => {
  const rounded = Math.floor(margin);

  if (rounded < 30) return "text-red-600";
  if (rounded < 50) return "text-orange-500";
  if (rounded < 70) return "text-emerald-600";
  return "text-clearcut";
};