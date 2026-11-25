import { readNumber } from "./amount";

const kyatthaPerViss = 100;

export function isVissUnit(unit: string) {
  return /^(ပိဿာ|ပိသာ|viss)$/iu.test(unit.trim());
}

export function readKyatthaSale(quantityInput: string, totalInput: string) {
  const quantity = readNumber(quantityInput, 1);
  const amount = readNumber(totalInput, 0);
  const stockMillis = Math.round(quantity * (1000 / kyatthaPerViss));
  if (quantity < 10 || !Number.isSafeInteger(stockMillis) || !Number.isSafeInteger(amount) || amount <= 0) return null;

  return { quantity, amount, stockMillis, unitPrice: amount / quantity };
}
