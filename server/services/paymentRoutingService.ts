/**
 * SchoolSoul Multi-Gateway Payment Routing Service
 * Orchestrates country-aware gateway selection, automatic fallback,
 * and unified checkout across Pesapal and Flutterwave.
 */

import type {
  PaymentProvider,
  UnifiedPaymentRequest,
  UnifiedPaymentResponse,
  UnifiedVerificationResult,
  UnifiedWebhookResult,
  UnifiedPaymentMethod,
  PaymentGatewayType,
} from './paymentTypes';
import { pesapalProvider } from './pesapalService';
import { mtnMoMoProvider } from './mtnMoMoService';
import { airtelMoneyProvider } from './airtelMoneyService';
import { bankPaymentProvider } from './bankPaymentService';
import { flutterwaveProvider } from './flutterwaveService';
import { readServerDB, writeServerDB } from '../db/store';

export interface SchoolGatewaySettings {
  schoolId: string;
  enablePesapal: boolean;
  enableMtnMoMo: boolean;
  enableAirtelMoney: boolean;
  enableBankPayment?: boolean;
  enableFlutterwave: boolean;
  preferredGateway?: PaymentGatewayType;
  environmentOverride?: 'sandbox' | 'production';
  updatedAt?: string;
  updatedBy?: string;
}

export interface AvailableGatewayOption {
  id: PaymentGatewayType;
  name: string;
  isAvailable: boolean;
  isPrimary: boolean;
  supportedCurrencies: string[];
  methods: UnifiedPaymentMethod[];
  healthStatus: string;
}

export class PaymentRoutingService {
  private providers: Map<PaymentGatewayType, PaymentProvider> = new Map();

  constructor() {
    this.providers.set('PESAPAL', pesapalProvider);
    this.providers.set('MTN_MOMO', mtnMoMoProvider);
    this.providers.set('AIRTEL_MONEY', airtelMoneyProvider);
    this.providers.set('BANK_TRANSFER', bankPaymentProvider);
    this.providers.set('BANK_PAYMENT', bankPaymentProvider);
    this.providers.set('FLUTTERWAVE', flutterwaveProvider);
  }

  public getProvider(gateway: PaymentGatewayType): PaymentProvider {
    const provider = this.providers.get(gateway);
    if (!provider) {
      throw new Error(`Payment gateway provider '${gateway}' is not registered.`);
    }
    return provider;
  }

  /**
   * Retrieve school-specific or system-default gateway configuration
   */
  public getSchoolGatewaySettings(schoolId: string): SchoolGatewaySettings {
    try {
      const db = readServerDB();
      const settings = db.schoolGatewaySettings?.find((s: any) => s.schoolId === schoolId);
      if (settings) return settings;
    } catch (e) {
      console.warn('[RoutingService] Error reading school gateway settings:', e);
    }

    // Default: MTN MoMo, Airtel Money, and Pesapal active
    return {
      schoolId,
      enablePesapal: true,
      enableMtnMoMo: true,
      enableAirtelMoney: true,
      enableFlutterwave: false,
      preferredGateway: 'PESAPAL',
    };
  }

  /**
   * Update school gateway configuration (Admin / Bursar only)
   */
  public updateSchoolGatewaySettings(settings: SchoolGatewaySettings, user?: { id: string; role: string }): SchoolGatewaySettings {
    const db = readServerDB();
    if (!db.schoolGatewaySettings) db.schoolGatewaySettings = [];

    const now = new Date().toISOString();
    const updated: SchoolGatewaySettings = {
      ...settings,
      updatedAt: now,
      updatedBy: user?.id || 'admin',
    };

    const index = db.schoolGatewaySettings.findIndex((s: any) => s.schoolId === settings.schoolId);
    if (index >= 0) {
      db.schoolGatewaySettings[index] = updated;
    } else {
      db.schoolGatewaySettings.push(updated);
    }

    writeServerDB(db);
    return updated;
  }

  /**
   * Resolve the primary and eligible payment gateways for a given country, currency, and user preference
   */
  public resolveGateway(
    countryCode: string,
    currency: string,
    _schoolId?: string,
    requestedGateway?: PaymentGatewayType
  ): PaymentProvider {
    if (requestedGateway && this.providers.has(requestedGateway)) {
      return this.getProvider(requestedGateway);
    }
    return this.getProvider('PESAPAL');
  }

  /**
   * Get all available gateways and payment methods for a given country and school
   * First-class payment methods: MTN Mobile Money, Airtel Money, Pesapal
   */
  public async getAvailableGateways(countryCode: string, currency: string, schoolId?: string): Promise<AvailableGatewayOption[]> {
    const c = countryCode.toUpperCase();
    const cur = currency.toUpperCase();
    const settings = schoolId ? this.getSchoolGatewaySettings(schoolId) : null;

    const options: AvailableGatewayOption[] = [];

    // 1. MTN Mobile Money (First-Class Payment Method)
    const mtn = this.getProvider('MTN_MOMO');
    const mtnHealth = await mtn.getHealthStatus();
    const mtnMethods = mtn.getSupportedPaymentMethods(c, cur);
    const mtnEnabled = !settings || settings.enableMtnMoMo !== false;

    options.push({
      id: 'MTN_MOMO',
      name: 'MTN Mobile Money',
      isAvailable: mtnEnabled && mtnMethods.length > 0,
      isPrimary: true,
      supportedCurrencies: mtn.getSupportedCurrencies(),
      methods: mtnMethods,
      healthStatus: mtnHealth.status,
    });

    // 2. Airtel Money (First-Class Payment Method)
    const airtel = this.getProvider('AIRTEL_MONEY');
    const airtelHealth = await airtel.getHealthStatus();
    const airtelMethods = airtel.getSupportedPaymentMethods(c, cur);
    const airtelEnabled = !settings || settings.enableAirtelMoney !== false;

    options.push({
      id: 'AIRTEL_MONEY',
      name: 'Airtel Money',
      isAvailable: airtelEnabled && airtelMethods.length > 0,
      isPrimary: true,
      supportedCurrencies: airtel.getSupportedCurrencies(),
      methods: airtelMethods,
      healthStatus: airtelHealth.status,
    });

    // 3. Pesapal (First-Class Payment Method)
    const pesapal = this.getProvider('PESAPAL');
    const pesapalHealth = await pesapal.getHealthStatus();
    const pesapalMethods = pesapal.getSupportedPaymentMethods(c, cur);
    const pesapalEnabled = !settings || settings.enablePesapal !== false;

    options.push({
      id: 'PESAPAL',
      name: 'Pesapal',
      isAvailable: pesapalEnabled && pesapalMethods.length > 0,
      isPrimary: true,
      supportedCurrencies: pesapal.getSupportedCurrencies(),
      methods: pesapalMethods,
      healthStatus: pesapalHealth.status,
    });

    // 4. Bank Payment / Manual Bank Transfer (First-Class Payment Method)
    const bank = this.getProvider('BANK_TRANSFER');
    const bankHealth = await bank.getHealthStatus();
    const bankMethods = bank.getSupportedPaymentMethods(c, cur);
    const bankEnabled = !settings || settings.enableBankPayment !== false;

    options.push({
      id: 'BANK_TRANSFER',
      name: 'Bank Payment',
      isAvailable: bankEnabled && bankMethods.length > 0,
      isPrimary: false,
      supportedCurrencies: bank.getSupportedCurrencies(),
      methods: bankMethods,
      healthStatus: bankHealth.status,
    });

    // 4. Flutterwave (Registered Abstraction - Inactive / Disabled for Production Release)
    const flwProvider = this.getProvider('FLUTTERWAVE');
    options.push({
      id: 'FLUTTERWAVE',
      name: 'Flutterwave Africa Gateway (Disabled)',
      isAvailable: false,
      isPrimary: false,
      supportedCurrencies: flwProvider.getSupportedCurrencies(),
      methods: [],
      healthStatus: 'DISABLED',
    });

    return options;
  }

  /**
   * Authoritative Unified Checkout Initiation
   * Production lock: Routes strictly to Pesapal without unverified gateway fallback.
   */
  public async initiatePayment(
    req: UnifiedPaymentRequest,
    preferredGateway?: PaymentGatewayType
  ): Promise<UnifiedPaymentResponse> {
    const provider = this.resolveGateway(req.countryCode, req.currency, req.schoolId, preferredGateway);

    try {
      return await provider.createPayment(req);
    } catch (err: any) {
      console.warn(`[PaymentRouter] ${provider.name} payment initiation failed: ${err.message}`);
      throw new Error(err.message || 'Payment service is temporarily unavailable. Please try again.');
    }
  }

  /**
   * Authoritative Unified Verification
   */
  public async verifyPayment(
    gateway: PaymentGatewayType,
    merchantReference: string,
    providerReference?: string
  ): Promise<UnifiedVerificationResult> {
    const provider = this.getProvider(gateway);
    return await provider.verifyPayment(merchantReference, providerReference);
  }

  /**
   * Unified Webhook Dispatcher
   */
  public async dispatchWebhook(
    gateway: PaymentGatewayType,
    headers: Record<string, string | string[] | undefined>,
    body: any
  ): Promise<UnifiedWebhookResult> {
    const provider = this.getProvider(gateway);
    return await provider.handleWebhook(headers, body);
  }
}

export const paymentRoutingService = new PaymentRoutingService();
