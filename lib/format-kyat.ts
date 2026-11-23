const numberFormat = new Intl.NumberFormat("en-US");

export function formatKyat(amount: number): string {
  return `${numberFormat.format(amount)} ကျပ်`;
}