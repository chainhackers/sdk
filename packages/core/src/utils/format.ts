import Decimal from "decimal.js";
import { formatUnits } from "viem";

/**
 * Formats a number or string representation of a number into a more readable string format,
 * with support for large numbers and optional control over decimal places and minimum displayable values.
 *
 * @param {string | number} input - The number or string representation of a number to be formatted.
 * @param {number} [maxDecimals=2] - The maximum number of decimal places to display after the decimal point.
 * @param {number} [minValue=1e-5] - The minimum value to display. Values smaller than this threshold will be shown as "< minValue".
 * @param {number} [trailingDecimals=2] - The number of decimal places to retain even if they are trailing zeros.
 *
 * @returns {string} - The formatted number as a string, potentially with a suffix indicating large numbers (e.g., "M" for million, "B" for billion).
 *
 * @example
 * // Small number with default params
 * formatAmount(123.456); // returns "123.46"
 *
 * @example
 * // Small number with max decimals
 * formatAmount(123.456, 1); // returns "123.5"
 *
 * @example
 * // Small number with a min value
 * formatAmount(0.000004, 2, 1e-5); // returns "< 0.00001"
 *
 * @example
 * // Large number with default params
 * formatAmount(123456789); // returns "123.46M"
 *
 * @example
 * // Large numbers with 4 decimals & trailing zeros
 * formatAmount(123.4000, 4, 1e-5, 4); // returns "123.4000"
 *
 * @example
 * // Large number with 3 decimals BUT 2 traling zeros
 * formatAmount(1500000000, 3, 1e-5, 2); // returns "1.50B"
 */
function _formatAmount(
  input: string | number,
  maxDecimals = 2, // Maximum decimals after the dot
  minValue = 1e-5, // Minimum displayable value
  trailingDecimals = 2, // Maximum decimals after the dot to keep even if they are trailing zero
): string {
  const amount = new Decimal(input);
  // Check min value
  if (amount.gt(0) && amount.lt(minValue)) {
    return `<${minValue}`;
  }

  let divisor = new Decimal(1);
  let suffix = "";
  // If number if larger or equals to 1 million, then format it
  if (amount.gte(1e6)) {
    const suffixes = ["M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
    const thresholds = [1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24];
    // Find the most appropriate suffix
    const index = thresholds.findIndex((threshold) =>
      amount.lt(new Decimal(threshold).times(1000)),
    );
    divisor = new Decimal(thresholds[index]!);
    suffix = suffixes[index]!;
  }

  // Format the number with max decimals
  let formattedNumber = amount.div(divisor).toFixed(maxDecimals);

  // Remove some trailing zeros if needed
  if (trailingDecimals < maxDecimals) {
    const [integerPart, decimalPart] = formattedNumber.split(".");
    if (decimalPart) {
      const significantPart = decimalPart.slice(0, trailingDecimals);
      // Remove all trailing zeros in the trailed part
      const trailedPart = decimalPart.slice(trailingDecimals).replace(/0+$/, "");
      formattedNumber = Number(decimalPart)
        ? `${integerPart}.${significantPart}${trailedPart}`
        : (integerPart ?? "0");
    }
  }
  const finalFormattedNumber = formattedNumber + suffix;
  // If string equals zero, returns "0" to avoid to have "0.00", etc
  return Number(finalFormattedNumber) === 0 ? "0" : finalFormattedNumber;
}

export function formatAmount(
  amount: string | number | undefined,
  formatType: FORMAT_TYPE = FORMAT_TYPE.STANDARD,
) {
  const value = amount || 0;
  const { maxDecimals, minValue, trailingDecimals } = formatTypes[formatType];
  return _formatAmount(value, maxDecimals, minValue, trailingDecimals);
}

export function formatRawAmount(
  rawAmount: bigint | undefined,
  decimals = 18,
  formatType: FORMAT_TYPE = FORMAT_TYPE.STANDARD,
) {
  const value = rawAmount || 0n;
  const amount = formatUnits(BigInt(value), decimals);
  return formatAmount(amount, formatType);
}
interface FormatOptions {
  maxDecimals: number;
  minValue: number;
  trailingDecimals: number;
}

export enum FORMAT_TYPE {
  MINIFY = "minify",
  STANDARD = "standard",
  PRECISE = "precise",
  FULL_PRECISE = "full_precise",
}

export const formatTypes: Record<FORMAT_TYPE, FormatOptions> = {
  [FORMAT_TYPE.MINIFY]: {
    maxDecimals: 2,
    minValue: 1e-2,
    trailingDecimals: 0,
  },
  [FORMAT_TYPE.STANDARD]: {
    maxDecimals: 4,
    minValue: 1e-4,
    trailingDecimals: 2,
  },
  [FORMAT_TYPE.PRECISE]: { maxDecimals: 9, minValue: 1e-9, trailingDecimals: 2 },
  [FORMAT_TYPE.FULL_PRECISE]: {
    maxDecimals: 18,
    minValue: 1e-18,
    trailingDecimals: 3,
  },
};
