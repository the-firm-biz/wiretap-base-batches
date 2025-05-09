/**
 * Very light wrapper around toLocaleString for standardising USD value formatting
 * 25.61 -> 25.61
 * 25 -> 25.00
 * 25.6 -> 25.60
 */
export function formatUsd(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
