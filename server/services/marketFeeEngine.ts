/**
 * SCHOOLSOUL OS — SERVER-SIDE SCHOOL MARKET MICRO-TRANSACTION FEE ENGINE
 * Authoritative Server Validation & Calculation
 *
 * COMMERCIAL RULES:
 * - Fixed transaction fee by bracket (NOT a percentage):
 *     UGX 1,000 – UGX 5,000          => UGX 50
 *     Above UGX 5,000 – UGX 10,000    => UGX 100
 *     Above UGX 10,000 – UGX 50,000+  => UGX 150
 * - Transactions below UGX 1,000: UGX 0
 * - International currencies: UGX rules do NOT apply automatically.
 */

export interface SchoolMarketFeeRule {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  fixedFee: number;
  currency: string;
  label: string;
  active: boolean;
}

export interface FeeCalculationResult {
  module: 'SCHOOL_MARKET';
  amount: number;
  currency: string;
  fee: number;
  bracketLabel: string;
  ruleApplied: string;
  isEligibleForFee: boolean;
  totalWithFee: number;
}

export const DEFAULT_UGX_MARKET_FEE_RULES: SchoolMarketFeeRule[] = [
  {
    id: 'ugx-bracket-1',
    minAmount: 1000,
    maxAmount: 5000,
    fixedFee: 50,
    currency: 'UGX',
    label: 'UGX 1,000 – UGX 5,000 (UGX 50 Fee)',
    active: true,
  },
  {
    id: 'ugx-bracket-2',
    minAmount: 5001,
    maxAmount: 10000,
    fixedFee: 100,
    currency: 'UGX',
    label: 'Above UGX 5,000 – UGX 10,000 (UGX 100 Fee)',
    active: true,
  },
  {
    id: 'ugx-bracket-3',
    minAmount: 10001,
    maxAmount: null,
    fixedFee: 150,
    currency: 'UGX',
    label: 'Above UGX 10,000 – UGX 50,000+ (UGX 150 Fee)',
    active: true,
  },
];

/**
 * Server-authoritative calculation of School Market transaction fee.
 */
export function calculateServerSchoolMarketFee(
  amount: number,
  currency = 'UGX',
  customRules: SchoolMarketFeeRule[] = DEFAULT_UGX_MARKET_FEE_RULES
): FeeCalculationResult {
  const normCurrency = (currency || 'UGX').trim().toUpperCase();
  const numAmount = Math.max(0, Number(amount) || 0);

  // International Currency Protection
  if (normCurrency !== 'UGX') {
    const foreignRule = customRules.find((r) => r.active && r.currency === normCurrency);
    if (!foreignRule) {
      return {
        module: 'SCHOOL_MARKET',
        amount: numAmount,
        currency: normCurrency,
        fee: 0,
        bracketLabel: 'International Currency (Standard)',
        ruleApplied: 'NON_UGX_UNCONFIGURED',
        isEligibleForFee: false,
        totalWithFee: numAmount,
      };
    }
  }

  // Under minimum threshold (< 1,000 UGX)
  if (numAmount < 1000) {
    return {
      module: 'SCHOOL_MARKET',
      amount: numAmount,
      currency: normCurrency,
      fee: 0,
      bracketLabel: 'Under UGX 1,000 (No Transaction Fee)',
      ruleApplied: 'UNDER_MINIMUM_THRESHOLD',
      isEligibleForFee: false,
      totalWithFee: numAmount,
    };
  }

  const activeRules = customRules.filter((r) => r.active && r.currency === normCurrency);
  for (const rule of activeRules) {
    const isAboveMin = numAmount >= rule.minAmount;
    const isBelowMax = rule.maxAmount === null || numAmount <= rule.maxAmount;

    if (isAboveMin && isBelowMax) {
      return {
        module: 'SCHOOL_MARKET',
        amount: numAmount,
        currency: normCurrency,
        fee: rule.fixedFee,
        bracketLabel: rule.label,
        ruleApplied: rule.id,
        isEligibleForFee: true,
        totalWithFee: numAmount + rule.fixedFee,
      };
    }
  }

  const defaultFee = 150;
  return {
    module: 'SCHOOL_MARKET',
    amount: numAmount,
    currency: normCurrency,
    fee: defaultFee,
    bracketLabel: 'Above UGX 10,000 – UGX 50,000+ (UGX 150 Fee)',
    ruleApplied: 'UGX_DEFAULT_HIGH_BRACKET',
    isEligibleForFee: true,
    totalWithFee: numAmount + defaultFee,
  };
}

/**
 * Validate and calculate complete order accounting breakdown.
 */
export function calculateAuthoritativeOrderBreakdown(params: {
  subtotal: number;
  discountAmount?: number;
  deliveryFee?: number;
  currency?: string;
}) {
  const subtotal = Math.max(0, Number(params.subtotal) || 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(params.discountAmount) || 0));
  const netProductTotal = Math.max(0, subtotal - discountAmount);
  const deliveryFee = Math.max(0, Number(params.deliveryFee) || 0);
  const currency = (params.currency || 'UGX').trim().toUpperCase();

  // Calculate School Market Fee on the net product subtotal
  const feeResult = calculateServerSchoolMarketFee(netProductTotal, currency);
  const schoolMarketFee = feeResult.fee;

  // Authoritative final total
  const totalPrice = netProductTotal + deliveryFee + schoolMarketFee;

  // Money accounting split:
  // - sellerAmount: net product revenue
  // - deliveryFee: courier fulfillment revenue
  // - schoolMarketFee: SchoolSoul platform micro-transaction fee
  // - platformFeeAmount: schoolMarketFee + any school commission (10% vocational fund)
  const platformCommission = Math.round(netProductTotal * 0.1);
  const platformFeeAmount = schoolMarketFee + platformCommission;
  const sellerAmount = Math.max(0, netProductTotal - platformCommission);

  return {
    subtotalPrice: subtotal,
    discountAmount,
    netProductTotal,
    deliveryFee,
    schoolMarketFee,
    totalPrice,
    currency,
    sellerAmount,
    platformFeeAmount,
    feeBracket: feeResult.bracketLabel,
    ruleApplied: feeResult.ruleApplied,
  };
}
