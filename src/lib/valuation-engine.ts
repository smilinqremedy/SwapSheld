// =====================================================================
// SwapShield Algorithmic Swap Valuation Engine
// Implements Section 4A Critical Business Logic
// =====================================================================

import { DeviceValuationInput, DeviceValuationResult, PenaltyBreakdownItem, SwapCalculationResult } from '@/types';

// Benchmark reference catalog with Nigerian Naira (NGN) trade-in values
export interface BenchmarkDevice {
  brand: string;
  model: string;
  storage: string;
  category: 'SMARTPHONE' | 'LAPTOP' | 'TABLET' | 'ACCESSORY';
  baseMarketPriceNGN: number;
}

export const DEVICE_BENCHMARKS: BenchmarkDevice[] = [
  // iPhones
  { brand: 'Apple', model: 'iPhone 15 Pro Max', storage: '256GB', category: 'SMARTPHONE', baseMarketPriceNGN: 1450000 },
  { brand: 'Apple', model: 'iPhone 15 Pro', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 1200000 },
  { brand: 'Apple', model: 'iPhone 15', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 920000 },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 1080000 },
  { brand: 'Apple', model: 'iPhone 14 Pro', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 950000 },
  { brand: 'Apple', model: 'iPhone 14', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 720000 },
  { brand: 'Apple', model: 'iPhone 13 Pro Max', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 820000 },
  { brand: 'Apple', model: 'iPhone 13 Pro', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 710000 },
  { brand: 'Apple', model: 'iPhone 13', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 580000 },
  { brand: 'Apple', model: 'iPhone 12 Pro Max', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 600000 },
  { brand: 'Apple', model: 'iPhone 12', storage: '64GB', category: 'SMARTPHONE', baseMarketPriceNGN: 420000 },
  { brand: 'Apple', model: 'iPhone 11', storage: '64GB', category: 'SMARTPHONE', baseMarketPriceNGN: 290000 },

  // MacBooks
  { brand: 'Apple', model: 'MacBook Pro 16" M3 Pro', storage: '512GB', category: 'LAPTOP', baseMarketPriceNGN: 2850000 },
  { brand: 'Apple', model: 'MacBook Pro 14" M2 Pro', storage: '512GB', category: 'LAPTOP', baseMarketPriceNGN: 1750000 },
  { brand: 'Apple', model: 'MacBook Pro 14" M1 Pro', storage: '512GB', category: 'LAPTOP', baseMarketPriceNGN: 1350000 },
  { brand: 'Apple', model: 'MacBook Air 15" M2', storage: '256GB', category: 'LAPTOP', baseMarketPriceNGN: 1150000 },
  { brand: 'Apple', model: 'MacBook Air 13" M2', storage: '256GB', category: 'LAPTOP', baseMarketPriceNGN: 950000 },
  { brand: 'Apple', model: 'MacBook Air 13" M1', storage: '256GB', category: 'LAPTOP', baseMarketPriceNGN: 620000 },

  // iPads
  { brand: 'Apple', model: 'iPad Pro 12.9" M2', storage: '256GB', category: 'TABLET', baseMarketPriceNGN: 1150000 },
  { brand: 'Apple', model: 'iPad Pro 11" M2', storage: '128GB', category: 'TABLET', baseMarketPriceNGN: 850000 },
  { brand: 'Apple', model: 'iPad Air 5th Gen M1', storage: '64GB', category: 'TABLET', baseMarketPriceNGN: 650000 },
  { brand: 'Apple', model: 'iPad 10th Gen', storage: '64GB', category: 'TABLET', baseMarketPriceNGN: 450000 },

  // Samsung & PC Flagships
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', storage: '256GB', category: 'SMARTPHONE', baseMarketPriceNGN: 1350000 },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', storage: '256GB', category: 'SMARTPHONE', baseMarketPriceNGN: 880000 },
  { brand: 'Samsung', model: 'Galaxy S22 Ultra', storage: '128GB', category: 'SMARTPHONE', baseMarketPriceNGN: 620000 },
  { brand: 'Dell', model: 'XPS 15 (Core i7, 16GB, RTX)', storage: '512GB', category: 'LAPTOP', baseMarketPriceNGN: 1250000 },
  { brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 10', storage: '512GB', category: 'LAPTOP', baseMarketPriceNGN: 980000 },
];

/**
 * Finds benchmark base price or computes approximate base value from storage/brand
 */
export function getBaseBenchmarkPrice(brand: string, model: string, storage: string): number {
  const normalizedModel = model.toLowerCase().trim();
  const normalizedStorage = storage.toLowerCase().trim();

  const exactMatch = DEVICE_BENCHMARKS.find(
    (b) =>
      b.brand.toLowerCase() === brand.toLowerCase() &&
      b.model.toLowerCase() === normalizedModel &&
      b.storage.toLowerCase() === normalizedStorage
  );

  if (exactMatch) return exactMatch.baseMarketPriceNGN;

  // Partial model match
  const partialMatch = DEVICE_BENCHMARKS.find(
    (b) =>
      b.brand.toLowerCase() === brand.toLowerCase() &&
      b.model.toLowerCase().includes(normalizedModel)
  );

  if (partialMatch) {
    let multiplier = 1.0;
    if (normalizedStorage.includes('512gb') || normalizedStorage.includes('1tb')) multiplier = 1.15;
    else if (normalizedStorage.includes('256gb')) multiplier = 1.08;
    return Math.round(partialMatch.baseMarketPriceNGN * multiplier);
  }

  // Fallback defaults by gadget category
  return 600000;
}

/**
 * Evaluates individual device and computes algorithmic deductions
 */
export function evaluateDevice(input: DeviceValuationInput): DeviceValuationResult {
  const baseValue = getBaseBenchmarkPrice(input.brand, input.model, input.storage_capacity);
  const penalties: PenaltyBreakdownItem[] = [];
  const flagReasons: string[] = [];
  let isFlagged = false;

  // 1. iCloud / MDM Security Check (Critical Anti-Scam Rule)
  if (input.icloud_or_mdm_status === 'BYPASSED_FLAGGED') {
    isFlagged = true;
    flagReasons.push('Device has iCloud or MDM restrictions/bypass detected. Trade is flagged by SwapShield anti-theft shield.');
  }

  // 2. Battery Health Rule: <80% -> -12% penalty
  if (input.battery_health_percentage < 80) {
    const penaltyAmt = Math.round(baseValue * 0.12);
    penalties.push({
      code: 'BATTERY_DEGRADED',
      label: 'Battery Health Below 80%',
      percentage: 12,
      amount: penaltyAmt,
      reason: `Reported battery capacity is ${input.battery_health_percentage}%. Replacement battery service deduction applied.`
    });
  } else if (input.battery_health_percentage < 85) {
    const penaltyAmt = Math.round(baseValue * 0.05);
    penalties.push({
      code: 'BATTERY_MODERATE',
      label: 'Battery Health 80-84%',
      percentage: 5,
      amount: penaltyAmt,
      reason: `Reported battery health is ${input.battery_health_percentage}%. Minor wear deduction applied.`
    });
  }

  // 3. Screen Status Rule:
  // Aftermarket -> -18% penalty
  // Cracked -> -25% penalty
  // Replaced OEM -> -6% penalty
  if (input.screen_status === 'REPLACED_AFTERMARKET') {
    const penaltyAmt = Math.round(baseValue * 0.18);
    penalties.push({
      code: 'SCREEN_AFTERMARKET',
      label: 'Aftermarket Display Replacement',
      percentage: 18,
      amount: penaltyAmt,
      reason: 'Non-original display panel installed (potential loss of True Tone, color gamut & resale value).'
    });
  } else if (input.screen_status === 'CRACKED') {
    const penaltyAmt = Math.round(baseValue * 0.25);
    penalties.push({
      code: 'SCREEN_CRACKED',
      label: 'Cracked Display Panel',
      percentage: 25,
      amount: penaltyAmt,
      reason: 'Screen has physical hairline or shatter cracks requiring full glass/LCD assembly swap.'
    });
  } else if (input.screen_status === 'REPLACED_OEM') {
    const penaltyAmt = Math.round(baseValue * 0.06);
    penalties.push({
      code: 'SCREEN_OEM_REPLACED',
      label: 'OEM Display Swapped',
      percentage: 6,
      amount: penaltyAmt,
      reason: 'Replaced with genuine original panel, minor deduction for opened chassis seal.'
    });
  }

  // 4. Cosmetic Grade:
  // FAIR_GRADE_C -> -10% penalty
  // GOOD_GRADE_B -> -4% penalty
  if (input.physical_condition === 'FAIR_GRADE_C') {
    const penaltyAmt = Math.round(baseValue * 0.10);
    penalties.push({
      code: 'GRADE_C_COSMETIC',
      label: 'Grade C (Noticeable Scuffs/Dents)',
      percentage: 10,
      amount: penaltyAmt,
      reason: 'Heavy scuffs, corner dings, or visible chassis wear.'
    });
  } else if (input.physical_condition === 'GOOD_GRADE_B') {
    const penaltyAmt = Math.round(baseValue * 0.04);
    penalties.push({
      code: 'GRADE_B_COSMETIC',
      label: 'Grade B (Light Micro-scratches)',
      percentage: 4,
      amount: penaltyAmt,
      reason: 'Normal minor pocket or desk scratches, structurally solid.'
    });
  }

  // 5. Biometrics / Face ID:
  // FAULTY -> -15% penalty
  if (input.face_id_or_biometrics === 'FAULTY') {
    const penaltyAmt = Math.round(baseValue * 0.15);
    penalties.push({
      code: 'BIOMETRICS_DEFECTIVE',
      label: 'Face ID / Touch ID Faulty',
      percentage: 15,
      amount: penaltyAmt,
      reason: 'Biometric security hardware is damaged or disabled.'
    });
  }

  const totalPenaltyPercentage = penalties.reduce((sum, p) => sum + p.percentage, 0);
  const totalDeductions = penalties.reduce((sum, p) => sum + p.amount, 0);
  const fairMarketValue = Math.max(50000, baseValue - totalDeductions);

  return {
    base_trade_in_value: baseValue,
    fair_market_value: fairMarketValue,
    penalties,
    total_penalty_percentage: totalPenaltyPercentage,
    is_flagged: isFlagged,
    flag_reasons: flagReasons
  };
}

/**
 * Calculates swap valuation between Device A (Offered) and Device B (Target)
 * Implements: recommended cash delta = target_fair_value - offered_fair_value
 */
export function calculateSwapValuation(
  offered: DeviceValuationInput,
  target: DeviceValuationInput
): SwapCalculationResult {
  const offeredEval = evaluateDevice(offered);
  const targetEval = evaluateDevice(target);

  const delta = targetEval.fair_market_value - offeredEval.fair_market_value;

  let whoPays: 'PROPOSER_PAYS' | 'TARGET_SELLER_PAYS' | 'STRAIGHT_SWAP' = 'STRAIGHT_SWAP';
  let summary = '';

  if (delta > 2000) {
    whoPays = 'PROPOSER_PAYS';
    summary = `Your offered device has a fair value of ₦${offeredEval.fair_market_value.toLocaleString()} vs. the target device at ₦${targetEval.fair_market_value.toLocaleString()}. Proposer should top up ₦${Math.abs(delta).toLocaleString()} in cash.`;
  } else if (delta < -2000) {
    whoPays = 'TARGET_SELLER_PAYS';
    summary = `Your offered device has higher fair value (₦${offeredEval.fair_market_value.toLocaleString()}) than the target device (₦${targetEval.fair_market_value.toLocaleString()}). Target seller should top up ₦${Math.abs(delta).toLocaleString()} to you.`;
  } else {
    whoPays = 'STRAIGHT_SWAP';
    summary = `Both devices are evaluated at equal fair market value (~₦${offeredEval.fair_market_value.toLocaleString()}). Recommended as an even direct swap without cash top-up.`;
  }

  return {
    offered_device: offeredEval,
    target_device: targetEval,
    recommended_cash_delta: delta,
    who_pays: whoPays,
    summary
  };
}
