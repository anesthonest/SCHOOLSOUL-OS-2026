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

// ============================================================================
// 8. AUTHORITATIVE STUDENT-BASED TIERED PRICING ARCHITECTURE (VINEXSAH TECHNOLOGIES)
// ============================================================================

export interface StudentPlanDefinition {
  id: string;
  tier: CommercialPlanTier;
  name: string;
  tagline: string;
  description: string;
  perStudentAnnualUSD: number;
  perStudentMonthlyUSD: number;
  minimumStudentFloor: number;
  isPopular?: boolean;
  isCustom?: boolean;
  features: string[];
  entitlements: {
    maxStudents: number;
    maxStaff: number;
    storageLimitMB: number;
    smsQuotaMonthly: number;
    onlineRooms: number;
    supportLevel: string;
    offlineLAN: boolean;
    marketplaceCommissionPercent: number;
  };
}

export const STUDENT_PRICING_PLANS: StudentPlanDefinition[] = [
  {
    id: 'plan-starter',
    tier: 'Starter',
    name: 'SchoolSoul Foundation',
    tagline: 'Essential academic records, CBC gradebook & offline attendance',
    description: 'Designed for primary & nursery institutions adopting structured digital governance on an accessible budget.',
    perStudentAnnualUSD: 2.00,
    perStudentMonthlyUSD: 0.22,
    minimumStudentFloor: 100,
    features: [
      'Offline-First Local Attendance Registers',
      'CBC & National Examination Gradebook',
      'Student Demographic Registers & Passports',
      'Standardized Report Card PDF Generation',
      'Single-device Local Vault Backup',
      'Email & Community Support (24-hr SLA)',
    ],
    entitlements: {
      maxStudents: 500,
      maxStaff: 30,
      storageLimitMB: 10000,
      smsQuotaMonthly: 1000,
      onlineRooms: 2,
      supportLevel: 'Standard Email SLA',
      offlineLAN: false,
      marketplaceCommissionPercent: 18,
    },
  },
  {
    id: 'plan-standard',
    tier: 'Standard',
    name: 'SchoolSoul Professional',
    tagline: 'Full daily digital operating system with LAN & mobile money',
    description: 'The standard choice for growing primary, secondary, and mixed institutions across East & Sub-Saharan Africa.',
    perStudentAnnualUSD: 5.00,
    perStudentMonthlyUSD: 0.50,
    minimumStudentFloor: 100,
    isPopular: true,
    features: [
      'Everything in Foundation',
      'Offline-First Multi-Device Local LAN Mesh Sync',
      'Pesapal, MTN & Airtel MoMo Fee Collection',
      'Automated Parent SMS & WhatsApp Notices',
      'Digital Student Passport & Dynamic QR Badges',
      'CBC Activity of Integration (AOI) Portfolios',
      'LearnGuard Safeguarding & Incident Audit',
      'Priority 4-Hour Response SLA',
    ],
    entitlements: {
      maxStudents: 2500,
      maxStaff: 150,
      storageLimitMB: 50000,
      smsQuotaMonthly: 5000,
      onlineRooms: 15,
      supportLevel: 'Priority 4-hr SLA',
      offlineLAN: true,
      marketplaceCommissionPercent: 15,
    },
  },
  {
    id: 'plan-enterprise-custom',
    tier: 'Enterprise',
    name: 'SchoolSoul Multi-Campus Enterprise',
    tagline: 'Institutional diocese networks, large colleges & international schools',
    description: 'Engineered for high-capacity school networks requiring custom domain CMS, biometric clusters, and dedicated SLA.',
    perStudentAnnualUSD: 9.50,
    perStudentMonthlyUSD: 0.95,
    minimumStudentFloor: 250,
    isCustom: true,
    features: [
      'Everything in Professional',
      'Unlimited Multi-Campus Consolidation',
      'Custom Branded Portal & School Website CMS',
      'Hardware Biometric Attendance Cluster Sync',
      'Dedicated 24/7 Account Manager & Phone SLA',
      'Custom UNEB/KNEC/Cambridge Transcripts',
      'Direct Banking API Integration (Host-to-Host)',
      'Lowest Marketplace Commission (10%)',
    ],
    entitlements: {
      maxStudents: 15000,
      maxStaff: 1000,
      storageLimitMB: 250000,
      smsQuotaMonthly: 25000,
      onlineRooms: 100,
      supportLevel: 'Dedicated 24/7 Account Manager',
      offlineLAN: true,
      marketplaceCommissionPercent: 10,
    },
  },
];

export interface CurrencyExchangeRule {
  currency: SupportedCurrency;
  symbol: string;
  name: string;
  rateVsUSD: number;
  taxRatePercent: number;
  taxLabel: string;
}

export const SUPPORTED_CURRENCY_RATES: Record<string, CurrencyExchangeRule> = {
  USD: { currency: 'USD', symbol: '$', name: 'US Dollar (Global)', rateVsUSD: 1, taxRatePercent: 0, taxLabel: 'Zero Export Tax' },
  UGX: { currency: 'UGX', symbol: 'UGX', name: 'Uganda Shilling', rateVsUSD: 3750, taxRatePercent: 18, taxLabel: '18% URA VAT' },
  KES: { currency: 'KES', symbol: 'KSh', name: 'Kenya Shilling', rateVsUSD: 133, taxRatePercent: 16, taxLabel: '16% KRA VAT' },
  TZS: { currency: 'TZS', symbol: 'TSh', name: 'Tanzania Shilling', rateVsUSD: 2650, taxRatePercent: 18, taxLabel: '18% TRA VAT' },
  RWF: { currency: 'RWF', symbol: 'FRw', name: 'Rwanda Franc', rateVsUSD: 1200, taxRatePercent: 18, taxLabel: '18% RRA VAT' },
  NGN: { currency: 'NGN', symbol: '₦', name: 'Nigeria Naira', rateVsUSD: 1450, taxRatePercent: 7.5, taxLabel: '7.5% FIRS VAT' },
  GHS: { currency: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', rateVsUSD: 12, taxRatePercent: 15, taxLabel: '15% GRA VAT' },
  ZMW: { currency: 'ZMW', symbol: 'ZK', name: 'Zambia Kwacha', rateVsUSD: 25, taxRatePercent: 16, taxLabel: '16% ZRA VAT' },
  ZAR: { currency: 'ZAR', symbol: 'R', name: 'South Africa Rand', rateVsUSD: 18.5, taxRatePercent: 15, taxLabel: '15% SARS VAT' },
  GBP: { currency: 'GBP', symbol: '£', name: 'British Pound', rateVsUSD: 0.78, taxRatePercent: 20, taxLabel: '20% HMRC VAT' },
  EUR: { currency: 'EUR', symbol: '€', name: 'Euro', rateVsUSD: 0.91, taxRatePercent: 19, taxLabel: '19% EU VAT' },
};

export interface CommercialAddon {
  id: string;
  name: string;
  description: string;
  monthlyUSD: number;
  annualUSD: number;
}

export const COMMERCIAL_ADDONS: CommercialAddon[] = [
  {
    id: 'addon-sms-bundle-5k',
    name: 'Bulk SMS Quota Pack (+5,000 SMS)',
    description: 'Instant parent delivery across MTN, Airtel, Safaricom, and Vodacom networks',
    monthlyUSD: 25,
    annualUSD: 250,
  },
  {
    id: 'addon-custom-cms',
    name: 'Custom Domain & School Website CMS',
    description: 'Deploy your official school portal on your own domain (e.g. portal.yourschool.ac.ug)',
    monthlyUSD: 15,
    annualUSD: 150,
  },
  {
    id: 'addon-biometric-sync',
    name: 'Biometric Hardware Attendance Driver',
    description: 'Direct optical & fingerprint terminal TCP/IP sync to attendance registers',
    monthlyUSD: 30,
    annualUSD: 300,
  },
  {
    id: 'addon-dedicated-sla',
    name: 'Dedicated 24/7 Telephone SLA & Account Lead',
    description: 'Guaranteed 15-minute emergency escalation and direct engineering phone support',
    monthlyUSD: 50,
    annualUSD: 500,
  },
];

export interface CalculatedStudentQuote {
  planId: string;
  planName: string;
  tier: CommercialPlanTier;
  studentCount: number;
  billedStudentCount: number;
  billingCycle: 'Annual' | 'Monthly';
  currency: string;
  currencySymbol: string;
  ratePerStudent: number;
  baseAmount: number;
  addonsAmount: number;
  selectedAddonIds: string[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  annualSavingsAmount: number;
  annualSavingsPercent: number;
  savingsFormatted: string;
}

export function calculateStudentSubscriptionQuote(params: {
  planId: string;
  studentCount: number;
  billingCycle: 'Annual' | 'Monthly';
  currency?: string;
  selectedAddonIds?: string[];
  discountCode?: string;
}): CalculatedStudentQuote {
  const plan = STUDENT_PRICING_PLANS.find((p) => p.id === params.planId) || STUDENT_PRICING_PLANS[1];
  const currKey = (params.currency || 'USD').toUpperCase();
  const currRule = SUPPORTED_CURRENCY_RATES[currKey] || SUPPORTED_CURRENCY_RATES.USD;

  const rawStudents = Math.max(0, Number(params.studentCount) || 100);
  const billedStudentCount = Math.max(rawStudents, plan.minimumStudentFloor);

  const isAnnual = params.billingCycle === 'Annual';

  // Rate in USD per student
  const usdRatePerStudent = isAnnual ? plan.perStudentAnnualUSD : plan.perStudentMonthlyUSD;
  const convertedRatePerStudent = Math.round(usdRatePerStudent * currRule.rateVsUSD * 100) / 100;

  // Base amount
  const baseAmountUSD = billedStudentCount * usdRatePerStudent;
  const baseAmount = Math.round(baseAmountUSD * currRule.rateVsUSD);

  // Add-ons
  const selectedAddons = params.selectedAddonIds || [];
  let addonsUSD = 0;
  for (const addonId of selectedAddons) {
    const addon = COMMERCIAL_ADDONS.find((a) => a.id === addonId);
    if (addon) {
      addonsUSD += isAnnual ? addon.annualUSD : addon.monthlyUSD;
    }
  }
  const addonsAmount = Math.round(addonsUSD * currRule.rateVsUSD);

  // Subtotal
  const subtotal = baseAmount + addonsAmount;

  // Discount
  let discountAmount = 0;
  if (params.discountCode && params.discountCode.toUpperCase() === 'VINEXSAH10') {
    discountAmount = Math.round(subtotal * 0.1);
  }

  const netSubtotal = Math.max(0, subtotal - discountAmount);

  // Tax
  const taxRatePercent = currRule.taxRatePercent;
  const taxAmount = Math.round((netSubtotal * taxRatePercent) / 100);
  const totalAmount = netSubtotal + taxAmount;

  // Savings calculation: comparing 12 months of monthly vs 1 year of annual
  const fullYearMonthlyUSD = billedStudentCount * plan.perStudentMonthlyUSD * 12;
  const annualUSD = billedStudentCount * plan.perStudentAnnualUSD;
  const savingsUSD = Math.max(0, fullYearMonthlyUSD - annualUSD);
  const annualSavingsAmount = Math.round(savingsUSD * currRule.rateVsUSD);
  const annualSavingsPercent = fullYearMonthlyUSD > 0 ? Math.round((savingsUSD / fullYearMonthlyUSD) * 100) : 0;

  const savingsFormatted = isAnnual
    ? `Save ${currRule.symbol} ${annualSavingsAmount.toLocaleString()} per year compared to monthly billing (~2 months free)`
    : `Switch to Annual to save ${currRule.symbol} ${annualSavingsAmount.toLocaleString()} per year (~${annualSavingsPercent}% savings)`;

  return {
    planId: plan.id,
    planName: plan.name,
    tier: plan.tier,
    studentCount: rawStudents,
    billedStudentCount,
    billingCycle: params.billingCycle,
    currency: currRule.currency,
    currencySymbol: currRule.symbol,
    ratePerStudent: convertedRatePerStudent,
    baseAmount,
    addonsAmount,
    selectedAddonIds: selectedAddons,
    subtotal,
    taxRatePercent,
    taxAmount,
    discountAmount,
    totalAmount,
    annualSavingsAmount,
    annualSavingsPercent,
    savingsFormatted,
  };
}

