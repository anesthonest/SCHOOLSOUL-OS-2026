/**
 * SchoolSoul Unified Payment Architecture
 * Provider-Agnostic Payment Contract & Data Types
 */

export type PaymentGatewayType = 'PESAPAL' | 'FLUTTERWAVE' | 'STRIPE' | 'SANDBOX';

export type PaymentLifecycleStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REVERSED'
  | 'REFUNDED';

export interface UnifiedPaymentMethod {
  id: string;
  name: string;
  category: 'MOBILE_MONEY' | 'CARD' | 'BANK_TRANSFER' | 'USSD' | 'QR' | 'SIMULATION';
  provider: PaymentGatewayType;
  instructions: string;
  icon?: string;
  supportedNetworks?: string[];
  isAvailable: boolean;
}

export interface UnifiedPaymentRequest {
  idempotencyKey?: string;
  schoolId: string;
  invoiceId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  countryCode: string;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  paymentMethod?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface UnifiedPaymentResponse {
  success: boolean;
  transactionId: string;
  merchantReference: string;
  providerReference?: string;
  redirectUrl?: string;
  status: PaymentLifecycleStatus;
  amount: number;
  currency: string;
  provider: PaymentGatewayType;
  instructions: string;
  isIdempotentReplay?: boolean;
  signatureSha256?: string;
  rawResponse?: any;
}

export interface UnifiedVerificationResult {
  success: boolean;
  verified: boolean;
  status: PaymentLifecycleStatus;
  amount: number;
  currency: string;
  merchantReference: string;
  providerReference: string;
  paymentMethod?: string;
  paymentAccount?: string;
  confirmationCode?: string;
  settledAt?: string;
  receiptNumber?: string;
  signatureSha256?: string;
  failureReason?: string;
  rawDetails?: any;
}

export interface UnifiedWebhookResult {
  handled: boolean;
  status: PaymentLifecycleStatus;
  merchantReference?: string;
  providerReference?: string;
  amount?: number;
  currency?: string;
  isDuplicate?: boolean;
  signatureValid: boolean;
  schoolId?: string;
  message?: string;
}

export interface UnifiedRefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  currency?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  message: string;
}

export interface PaymentProvider {
  readonly name: PaymentGatewayType;
  readonly displayName: string;

  /**
   * Authoritatively initiate a payment order with the gateway
   */
  createPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse>;

  /**
   * Authoritatively verify payment state directly with the upstream gateway API
   */
  verifyPayment(merchantReference: string, providerReference?: string): Promise<UnifiedVerificationResult>;

  /**
   * Handle incoming asynchronous webhook / IPN notification from the gateway
   */
  handleWebhook(headers: Record<string, string | string[] | undefined>, body: any): Promise<UnifiedWebhookResult>;

  /**
   * Execute or request a refund for an authorized transaction
   */
  refundPayment?(transactionId: string, amount?: number, reason?: string): Promise<UnifiedRefundResult>;

  /**
   * Retrieve cached or live status of a payment record
   */
  getPaymentStatus(merchantReference: string): Promise<UnifiedVerificationResult>;

  /**
   * Validate amount according to currency and gateway constraints
   */
  validateAmount(amount: number): boolean;

  /**
   * Validate currency supported by the gateway
   */
  validateCurrency(currency: string): boolean;

  /**
   * Validate merchant reference format
   */
  validateReference(reference: string): boolean;

  /**
   * Get supported currencies list
   */
  getSupportedCurrencies(): string[];

  /**
   * Get country-specific supported payment methods
   */
  getSupportedPaymentMethods(countryCode: string, currency: string): UnifiedPaymentMethod[];

  /**
   * Check gateway health and connectivity
   */
  getHealthStatus(): Promise<any>;
}
