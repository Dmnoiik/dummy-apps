export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatMoney(n: number): string {
  return (round2(n) || 0).toFixed(2);
}

/** Balance label such as "+66.67 PLN" or "-33.33 PLN". */
export function formatSigned(n: number): string {
  const value = round2(n) || 0;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} PLN`;
}
