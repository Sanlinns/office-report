export function readNumber(raw: string, decimals: number) {
  const value = raw.trim().replace(/[၀-၉]/g, (digit) => String(digit.charCodeAt(0) - 0x1040));
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value)) return NaN;
  if ((value.split(".")[1]?.length ?? 0) > decimals) return NaN;
  return Number(value.replaceAll(",", ""));
}

export function purchaseAmount(quantity: string, cost: string) {
  const quantityMillis = Math.round(readNumber(quantity, 3) * 1000);
  const unitCost = readNumber(cost, 0);
  const scaled = quantityMillis * unitCost;
  if (quantityMillis <= 0 || !Number.isSafeInteger(quantityMillis) ||
      !Number.isSafeInteger(unitCost) || !Number.isSafeInteger(scaled)) return NaN;
  return Math.round(scaled / 1000);
}
