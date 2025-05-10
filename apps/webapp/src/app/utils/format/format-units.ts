import { formatUnits as viemFormatUnits } from 'viem';

/**
 * Expands Viem's formatUnits to:
 * - Return of type number
 * - Optionally round to a specific number of decimals
 */
export function formatUnits(
  value: bigint,
  decimals = 18,
  roundingDecimals = 2
): number {
  const formattedValue = viemFormatUnits(value, decimals);
  const formattedValueNumber = Number(formattedValue);

  if (roundingDecimals) {
    const factor = Math.pow(10, roundingDecimals);
    return Math.round(formattedValueNumber * factor) / factor;
  }

  return formattedValueNumber;
}
