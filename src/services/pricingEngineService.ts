import type {
  PricingConfiguration,
  CountryPricingRule,
  SupportedCurrency,
  PlanCapacities,
  CommercialPlanTier,
} from '../types';

const PRICING_CONFIG_KEY = 'schoolsoul_pricing_configuration_v2';
const PRICING_VERSIONS_KEY = 'schoolsoul_pricing_versions_v2';
const COUNTRY_PRICING_KEY = 'schoolsoul_country_pricing_v2';

// 1. Initial Authoritative Standard Pricing Configuration ($79 / mo, $790 / yr)
export const DEFAULT_STANDARD_CAPACITIES: PlanCapacities = {
  maximum_active_students: 1000,
  maximum_staff: 75,
  storage_limit_mb: 50000, // 50 GB
  communication_limit_sms: 5000,
  media_limit_mb: 25000, // 25 GB
  online_learning_capacity_rooms: 15,
  marketplace_enabled: true,
  advanced_analytics_enabled: true,
  website_enabled: true,
  support_level: 'Standard Priority 4-hr SLA',
};

export const INITIAL_AUTHORITATIVE_PRICING: PricingConfiguration = {
  versionId: 'ver-2026-std-v1',
  planId: 'plan-standard',
  planName: 'SchoolSoul Standard',
  tier: 'Standard',
  currency: 'USD',
  currencySymbol: '$',
  monthlyPrice: 79,
  annualPrice: 790,
  trialDays: 30,
  active: true,
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  capacities: DEFAULT_STANDARD_CAPACITIES,
  taxRatePercent: 0,
  taxJurisdiction: 'Global Standard',
  countryCode: 'GLOBAL',
  paymentProviderDefault: 'Card',
  paymentInstructions: 'Automatic recurring card billing or manual bank wire settlement.',
  notes: 'Authoritative baseline pricing for growing educational institutions worldwide.',
};

// 2. Pre-configured Country Pricing Engine
export const DEFAULT_COUNTRY_PRICING_RULES: CountryPricingRule[] = [
  {
    countryCode: 'US',
    countryName: 'United States & Global',
    currency: 'USD',
    currencySymbol: '$',
    monthlyPrice: 79,
    annualPrice: 790,
    taxRatePercent: 0,
    taxLabel: 'State Sales Tax (Where Applicable)',
    primaryProvider: 'Card',
    paymentInstructions: 'Pay online via Visa, Mastercard, American Express, or ACH.',
    isActive: true,
  },
  {
    countryCode: 'UG',
    countryName: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'UGX',
    monthlyPrice: 295000,
    annualPrice: 2950000,
    taxRatePercent: 18,
    taxLabel: 'URA VAT (18%)',
    primaryProvider: 'MobileMoney',
    paymentInstructions: 'Pay via MTN MoMo Merchant Code (849201) or Airtel Money Pay (991204).',
    isActive: true,
  },
  {
    countryCode: 'KE',
    countryName: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    monthlyPrice: 10500,
    annualPrice: 105000,
    taxRatePercent: 16,
    taxLabel: 'KRA VAT (16%)',
    primaryProvider: 'MobileMoney',
    paymentInstructions: 'Pay via Safaricom M-Pesa Buy Goods Till or Paybill 892011.',
    isActive: true,
  },
  {
    countryCode: 'NG',
    countryName: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    monthlyPrice: 115000,
    annualPrice: 1150000,
    taxRatePercent: 7.5,
    taxLabel: 'FIRS VAT (7.5%)',
    primaryProvider: 'Card',
    paymentInstructions: 'Pay via Card or Bank Transfer powered by Pesapal.',
    isActive: true,
  },
  {
    countryCode: 'ZA',
    countryName: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    monthlyPrice: 1450,
    annualPrice: 14500,
    taxRatePercent: 15,
    taxLabel: 'SARS VAT (15%)',
    primaryProvider: 'Card',
    paymentInstructions: 'Pay via Ozow Instant EFT or Credit Card.',
    isActive: true,
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    monthlyPrice: 65,
    annualPrice: 650,
    taxRatePercent: 20,
    taxLabel: 'HMRC VAT (20%)',
    primaryProvider: 'Card',
    paymentInstructions: 'Direct Debit / BACS or Corporate Credit Card.',
    isActive: true,
  },
  {
    countryCode: 'EU',
    countryName: 'European Union',
    currency: 'EUR',
    currencySymbol: '€',
    monthlyPrice: 75,
    annualPrice: 750,
    taxRatePercent: 19,
    taxLabel: 'EU Standard VAT (19%)',
    primaryProvider: 'Card',
    paymentInstructions: 'SEPA Direct Debit or Euro Card Gateway.',
    isActive: true,
  },
];

// 3. Centralized Dynamic Annual Savings Calculator
export function calculateDynamicAnnualSavings(
  monthlyPrice: number,
  annualPrice: number,
  currencySymbol: string = '$'
): {
  savingsAmount: number;
  savingsPercent: number;
  monthsFreeEquivalent: number;
  formattedSavingsText: string;
} {
  const fullYearMonthlyCost = monthlyPrice * 12;
  const savingsAmount = Math.max(0, fullYearMonthlyCost - annualPrice);
  const savingsPercent = fullYearMonthlyCost > 0 ? Math.round((savingsAmount / fullYearMonthlyCost) * 100) : 0;
  const monthsFreeEquivalent = monthlyPrice > 0 ? Math.round((savingsAmount / monthlyPrice) * 10) / 10 : 0;

  const formattedSavingsText =
    savingsAmount > 0
      ? `Save approximately ${currencySymbol}${savingsAmount.toLocaleString()} compared with paying monthly for 12 months (~${monthsFreeEquivalent} months free).`
      : 'Standard annual payment terms.';

  return {
    savingsAmount,
    savingsPercent,
    monthsFreeEquivalent,
    formattedSavingsText,
  };
}

// 4. Retrieve Authoritative Active Pricing Configuration
export async function getAuthoritativePricingConfig(): Promise<PricingConfiguration> {
  try {
    const raw = localStorage.getItem(PRICING_CONFIG_KEY);
    if (raw) {
      const parsed: PricingConfiguration = JSON.parse(raw);
      if (parsed && parsed.monthlyPrice > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error fetching pricing configuration from storage:', e);
  }

  localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(INITIAL_AUTHORITATIVE_PRICING));
  return INITIAL_AUTHORITATIVE_PRICING;
}

// 5. Update Active Pricing Configuration (Platform Admin only)
export async function updateAuthoritativePricingConfig(
  updates: Partial<PricingConfiguration>
): Promise<PricingConfiguration> {
  const current = await getAuthoritativePricingConfig();
  const updated: PricingConfiguration = {
    ...current,
    ...updates,
    capacities: {
      ...current.capacities,
      ...(updates.capacities || {}),
    },
  };

  localStorage.setItem(PRICING_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

// 6. Price Versioning Engine (Create Scheduled Future Price)
export async function createPricingVersion(
  newVersion: Omit<PricingConfiguration, 'versionId'>
): Promise<PricingConfiguration> {
  const versionId = `ver-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const created: PricingConfiguration = {
    ...newVersion,
    versionId,
  };

  const versions = await getPricingVersions();
  versions.push(created);
  localStorage.setItem(PRICING_VERSIONS_KEY, JSON.stringify(versions));

  // If set to active immediately, update main pointer
  if (created.active) {
    await updateAuthoritativePricingConfig(created);
  }

  return created;
}

export async function getPricingVersions(): Promise<PricingConfiguration[]> {
  try {
    const raw = localStorage.getItem(PRICING_VERSIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading pricing versions:', e);
  }
  const initial = [INITIAL_AUTHORITATIVE_PRICING];
  localStorage.setItem(PRICING_VERSIONS_KEY, JSON.stringify(initial));
  return initial;
}

// 7. Country Pricing Rules Engine
export async function getCountryPricingRules(): Promise<CountryPricingRule[]> {
  try {
    const raw = localStorage.getItem(COUNTRY_PRICING_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading country pricing rules:', e);
  }
  localStorage.setItem(COUNTRY_PRICING_KEY, JSON.stringify(DEFAULT_COUNTRY_PRICING_RULES));
  return DEFAULT_COUNTRY_PRICING_RULES;
}

export async function updateCountryPricingRule(rule: CountryPricingRule): Promise<void> {
  const rules = await getCountryPricingRules();
  const index = rules.findIndex((r) => r.countryCode === rule.countryCode);
  if (index >= 0) {
    rules[index] = rule;
  } else {
    rules.push(rule);
  }
  localStorage.setItem(COUNTRY_PRICING_KEY, JSON.stringify(rules));
}

export async function getPricingRuleForCountry(countryCode: string): Promise<CountryPricingRule> {
  const rules = await getCountryPricingRules();
  return rules.find((r) => r.countryCode === countryCode) || rules[0];
}
