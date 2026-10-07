/**
 * SwapShield Hardware Identity & IMEI Luhn Checksum Validator
 * Validates international mobile equipment identity numbers before SHA-256 cryptographic binding.
 */

export interface ImeiValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a 15-digit IMEI using the standard Luhn algorithm.
 *
 * Algorithm details:
 * 1. Strip spaces, hyphens, and whitespace.
 * 2. Ensure the string is exactly 15 numeric digits.
 * 3. Double every second digit from the left (odd indexes in 0-based indexing: 1, 3, 5, 7, 9, 11, 13).
 * 4. If doubling produces a two-digit number, sum the digits (e.g., 8 * 2 = 16 -> 1 + 6 = 7).
 * 5. Sum all digits. The total must be divisible by 10 (sum % 10 === 0).
 */
export function validateIMEI(imei: string): ImeiValidationResult {
  if (!imei || typeof imei !== 'string') {
    return { isValid: false, error: 'IMEI is required' };
  }

  // Strip whitespace and hyphens
  const cleaned = imei.replace(/[\s\-]/g, '');

  // Must be strictly numeric
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'IMEI must contain only numeric digits' };
  }

  // Must be exactly 15 digits
  if (cleaned.length !== 15) {
    return {
      isValid: false,
      error: `IMEI must be exactly 15 digits (received ${cleaned.length})`
    };
  }

  let sum = 0;

  for (let i = 0; i < 15; i++) {
    const digit = parseInt(cleaned[i], 10);

    // Double every second digit from the left (i.e. positions 2, 4, 6, 8, 10, 12, 14 -> index % 2 === 1)
    if (i % 2 === 1) {
      const doubled = digit * 2;
      // If two digits, sum them (e.g. 16 -> 1 + 6 = 7; equivalent to doubled - 9 when doubled > 9)
      sum += doubled > 9 ? Math.floor(doubled / 10) + (doubled % 10) : doubled;
    } else {
      sum += digit;
    }
  }

  if (sum % 10 !== 0) {
    return {
      isValid: false,
      error: 'Invalid IMEI Checksum (Luhn check failed)'
    };
  }

  return { isValid: true };
}

/**
 * Formats a 15-digit IMEI into standard segmented display format:
 * AA-BBBBBB-CCCCCC-D (TAC: 8 digits, SNR: 6 digits, CD: 1 digit)
 * E.g., 35-689211-048821-9
 */
export function formatIMEI(imei: string): string {
  if (!imei) return '';
  const cleaned = imei.replace(/[\s\-]/g, '');
  if (cleaned.length !== 15) return cleaned;

  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 8)}-${cleaned.slice(8, 14)}-${cleaned.slice(14)}`;
}
