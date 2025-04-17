export const numFormatter = (value: number): string => {
  return parseFloat(value.toString()).toFixed(2);
};

export const currencyFormatter = ( currency: string, value: number): string => {
  const result = currency + numFormatter(value)
  return result;
};
