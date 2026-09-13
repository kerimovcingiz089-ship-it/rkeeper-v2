import type { MenuItem } from "../types";

export const WEIGHTED_PREFIX = "22";
export const WEIGHTED_CODE_LENGTH = 13;

export interface WeightedBarcode {
  plu: number;
  weightGrams: number;
  weightKg: number;
}

export function isWeightedBarcode(code: string): boolean {
  return /^\d{13}$/.test(code) && code.startsWith(WEIGHTED_PREFIX);
}

export function parseWeightedBarcode(code: string): WeightedBarcode | null {
  if (!isWeightedBarcode(code)) return null;
  const plu = parseInt(code.slice(2, 7), 10);
  const weightGrams = parseInt(code.slice(7, 12), 10);
  return { plu, weightGrams, weightKg: weightGrams / 1000 };
}

export function findItemByBarcode(items: MenuItem[], code: string): MenuItem | undefined {
  if (!code) return undefined;
  if (isWeightedBarcode(code)) {
    const parsed = parseWeightedBarcode(code)!;
    return (
      items.find((i) => i.pluCode != null && String(i.pluCode) === String(parsed.plu)) ||
      items.find((i) => i.barcode === code)
    );
  }
  return items.find((i) => i.barcode === code);
}