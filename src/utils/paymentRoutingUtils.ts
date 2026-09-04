/**
 * SchoolSoul Client Payment Routing & Phone Normalization Utilities
 * Handles phone normalization, mobile network detection,
 * and payment method validation for Pesapal 3.0.
 */

export type PesapalPaymentMethodType = 
  | 'MTN_MOBILE_MONEY'
  | 'AIRTEL_MONEY'
  | 'MPESA'
  | 'CARD'
  | 'BURSAR_CASH_RECEIPT'
  | 'BANK_TRANSFER'
  | 'SANDBOX';

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  network: 'MTN' | 'AIRTEL' | 'SAFARICOM' | 'UNKNOWN';
  countryCode: string;
  error?: string;
  warning?: string;
}

/**
 * Normalizes phone number into international E.164 without spaces/dashes.
 */
export function normalizePhoneNumber(rawPhone: string, defaultCountry: string = 'UG'): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      network: 'UNKNOWN',
      countryCode: defaultCountry,
      error: 'Phone number is required.',
    };
  }

  // Strip spaces, dashes, brackets, dots
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '').trim();

  // If starts with 00, replace with +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.substring(2);
  }

  const country = defaultCountry.toUpperCase();

  // Handle Uganda (UG / +256)
  if (country === 'UG' || cleaned.startsWith('+256') || cleaned.startsWith('256')) {
    if (cleaned.startsWith('+256')) {
      cleaned = cleaned;
    } else if (cleaned.startsWith('256')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '+256' + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
      cleaned = '+256' + cleaned;
    }

    const ugRegex = /^\+256(7\d|3\d)\d{7}$/;
    if (!ugRegex.test(cleaned)) {
      return {
        isValid: false,
        normalized: cleaned,
        network: 'UNKNOWN',
        countryCode: 'UG',
        error: 'Please enter a valid 10-digit Uganda mobile number (e.g. 0772 123 456 or +256 700 123 456).',
      };
    }

    // Detect network
    let network: 'MTN' | 'AIRTEL' | 'UNKNOWN' = 'UNKNOWN';
    const prefix2 = cleaned.substring(4, 6); // e.g. 77, 78, 70, 75

    // MTN Uganda prefixes: 77, 78, 76, 39, 31
    if (['77', '78', '76', '39', '31'].includes(prefix2)) {
      network = 'MTN';
    }
    // Airtel Uganda prefixes: 70, 75, 74, 32
    else if (['70', '75', '74', '32'].includes(prefix2)) {
      network = 'AIRTEL';
    }

    return {
      isValid: true,
      normalized: cleaned,
      network,
      countryCode: 'UG',
    };
  }

  // Handle Kenya (KE / +254)
  if (country === 'KE' || cleaned.startsWith('+254') || cleaned.startsWith('254')) {
    if (cleaned.startsWith('+254')) {
      cleaned = cleaned;
    } else if (cleaned.startsWith('254')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '+254' + cleaned.substring(1);
    }

    const keRegex = /^\+254(7\d|1\d)\d{7}$/;
    if (!keRegex.test(cleaned)) {
      return {
        isValid: false,
        normalized: cleaned,
        network: 'UNKNOWN',
        countryCode: 'KE',
        error: 'Please enter a valid Kenya mobile number (e.g. 0712 345 678 or +254 712 345 678).',
      };
    }

    const prefix2 = cleaned.substring(4, 6);
    let network: 'SAFARICOM' | 'AIRTEL' | 'UNKNOWN' = 'UNKNOWN';
    if (['70', '71', '72', '79', '11'].includes(prefix2)) {
      network = 'SAFARICOM';
    } else if (['73', '78'].includes(prefix2)) {
      network = 'AIRTEL';
    }

    return {
      isValid: true,
      normalized: cleaned,
      network,
      countryCode: 'KE',
    };
  }

  // General international format
  if (!cleaned.startsWith('+') && cleaned.startsWith('0')) {
    cleaned = '+256' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }

  const intlRegex = /^\+[1-9]\d{8,14}$/;
  if (!intlRegex.test(cleaned)) {
    return {
      isValid: false,
      normalized: cleaned,
      network: 'UNKNOWN',
      countryCode: defaultCountry,
      error: 'Invalid international phone number format. Must start with + and country code.',
    };
  }

  return {
    isValid: true,
    normalized: cleaned,
    network: 'UNKNOWN',
    countryCode: defaultCountry,
  };
}

/**
 * Validate phone number against selected mobile money method.
 */
export function validatePaymentMethodAndPhone(
  paymentMethod: string,
  rawPhone: string,
  countryCode: string = 'UG'
): { isValid: boolean; normalizedPhone: string; network?: string; error?: string; warning?: string } {
  const norm = normalizePhoneNumber(rawPhone, countryCode);

  if (paymentMethod === 'MTN_MOBILE_MONEY' || paymentMethod === 'MTN') {
    if (!norm.isValid) {
      return { isValid: false, normalizedPhone: norm.normalized, network: norm.network, error: norm.error };
    }
    if (norm.network === 'AIRTEL') {
      return {
        isValid: true,
        normalizedPhone: norm.normalized,
        network: norm.network,
        warning: 'This number appears to belong to Airtel Uganda. If paying via Airtel, please select Airtel Money for faster routing.',
      };
    }
    return { isValid: true, normalizedPhone: norm.normalized, network: norm.network };
  }

  if (paymentMethod === 'AIRTEL_MONEY' || paymentMethod === 'AIRTEL') {
    if (!norm.isValid) {
      return { isValid: false, normalizedPhone: norm.normalized, network: norm.network, error: norm.error };
    }
    if (norm.network === 'MTN') {
      return {
        isValid: true,
        normalizedPhone: norm.normalized,
        network: norm.network,
        warning: 'This number appears to belong to MTN Uganda. If paying via MTN MoMo, please select MTN Mobile Money for faster routing.',
      };
    }
    return { isValid: true, normalizedPhone: norm.normalized, network: norm.network };
  }

  if (paymentMethod === 'MPESA') {
    if (!norm.isValid) {
      return { isValid: false, normalizedPhone: norm.normalized, network: norm.network, error: norm.error };
    }
    return { isValid: true, normalizedPhone: norm.normalized, network: norm.network };
  }

  // Card or offline methods
  return {
    isValid: true,
    normalizedPhone: norm.isValid ? norm.normalized : rawPhone,
    network: norm.network,
  };
}

/**
 * Standard readable label for payment methods
 */
export function getPaymentMethodDisplayName(method: string): string {
  switch (method?.toUpperCase()) {
    case 'MTN_MOBILE_MONEY':
    case 'MTN':
    case 'MTN MOMO':
    case 'PESAPAL_MTN_MOMO':
      return 'MTN Mobile Money';
    case 'AIRTEL_MONEY':
    case 'AIRTEL':
    case 'PESAPAL_AIRTEL_MONEY':
      return 'Airtel Money';
    case 'MPESA':
    case 'M-PESA':
      return 'Safaricom M-PESA';
    case 'CARD':
    case 'PESAPAL_CARD':
    case 'CREDIT_CARD':
      return 'Credit / Debit Card (Visa & Mastercard)';
    case 'BURSAR_CASH_RECEIPT':
    case 'BURSAR':
    case 'BURSAR_COLLECTION':
    case 'SCHOOL BURSAR CASH COUNTER':
      return 'School Bursar Cash Counter';
    case 'BANK_TRANSFER':
    case 'BANK':
      return 'Bank Transfer / Deposit';
    case 'SANDBOX':
      return 'Sandbox Test Verification';
    default:
      return method || 'Pesapal Payment Gateway';
  }
}
