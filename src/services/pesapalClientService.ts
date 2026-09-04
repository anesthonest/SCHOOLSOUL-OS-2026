/**
 * SchoolSoul Pesapal Client Service
 * Frontend bridge communicating strictly with SchoolSoul backend API routes.
 * The client NEVER stores or transmits Pesapal merchant secret keys.
 */

export interface PesapalHealthInfo {
  environment: 'sandbox' | 'production';
  baseUrl: string;
  paymentsEnabled: boolean;
  credentialsConfigured: boolean;
  consumerKeyMasked: string;
  tokenHealthy: boolean;
  tokenExpiresAt?: string;
  ipnConfigured: boolean;
  ipnId?: string;
  ipnUrl?: string;
  lastSuccessfulAuth?: string;
  lastSuccessfulTransactionCheck?: string;
  lastIPNReceivedAt?: string;
  lastError?: string;
  status: 'READY_PRODUCTION' | 'READY_SANDBOX' | 'MERCHANT_ACTIVATION_REQUIRED' | 'IPN_CONFIGURATION_REQUIRED' | 'NOT_CONFIGURED';
}

export interface PesapalOrderResult {
  status: string;
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
  invoice: any;
  amount: number;
  currency: string;
  message: string;
}

export interface PesapalVerificationResult {
  status: string;
  verified: boolean;
  transactionStatus: 'COMPLETED' | 'PENDING' | 'FAILED' | 'INVALID' | 'REFUNDED';
  message: string;
  paymentRecord?: any;
  pesapalResponse?: any;
  receipt?: {
    receiptNumber: string;
    schoolId: string;
    invoiceId: string;
    invoiceNumber: string;
    merchantReference: string;
    pesapalTrackingId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    confirmationCode: string;
    settledAt: string;
    status: string;
    signatureSha256: string;
  };
}

export interface PesapalTestSpecResult {
  id: string;
  name: string;
  category: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  details: string;
  durationMs: number;
}

export interface PesapalTestSuiteReport {
  status: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  results: PesapalTestSpecResult[];
  executedAt: string;
}

export class PesapalClientService {
  /**
   * Fetch live Pesapal Gateway health and diagnostic status
   */
  static async getHealth(): Promise<PesapalHealthInfo> {
    try {
      const res = await fetch('/api/billing/pesapal/health');
      if (!res.ok) {
        throw new Error(`Health check returned status ${res.status}`);
      }
      const data = await res.json();
      return data.health;
    } catch (err: any) {
      return {
        environment: 'sandbox',
        baseUrl: 'https://cybqa.pesapal.com/pesapalv3',
        paymentsEnabled: false,
        credentialsConfigured: false,
        consumerKeyMasked: 'NOT_SET',
        tokenHealthy: false,
        ipnConfigured: false,
        lastError: err.message,
        status: 'NOT_CONFIGURED',
      };
    }
  }

  /**
   * Register Pesapal IPN URL
   */
  static async registerIPN(url?: string): Promise<{ ipn_id: string; message: string }> {
    const res = await fetch('/api/billing/pesapal/register-ipn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, notificationType: 'POST' }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Failed to register IPN');
    }

    const data = await res.json();
    return {
      ipn_id: data.result?.ipn_id || '',
      message: data.message || 'IPN registered successfully',
    };
  }

  /**
   * Retrieve list of registered IPNs
   */
  static async getIPNList(): Promise<any[]> {
    const res = await fetch('/api/billing/pesapal/ipn-list');
    if (!res.ok) throw new Error('Failed to retrieve IPN list');
    const data = await res.json();
    return data.ipns || [];
  }

  /**
   * Submit Authoritative Order to backend (which submits to Pesapal API 3.0)
   */
  static async submitOrder(params: {
    schoolId: string;
    schoolName: string;
    billingCycle: 'Monthly' | 'Annual';
    planTier?: string;
    currency?: string;
    countryCode?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    paymentMethod?: string;
  }): Promise<PesapalOrderResult> {
    const res = await fetch('/api/billing/pesapal/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId: params.schoolId,
        schoolName: params.schoolName,
        billingCycle: params.billingCycle,
        planTier: params.planTier || 'Standard',
        currency: params.currency || 'UGX',
        countryCode: params.countryCode || 'UG',
        customerEmail: params.customerEmail,
        customerPhone: params.customerPhone,
        customerName: params.customerName,
        paymentMethod: params.paymentMethod,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Failed to initiate Pesapal payment order');
    }

    return (await res.json()) as PesapalOrderResult;
  }

  /**
   * Verify transaction independently with backend and Pesapal API 3.0
   */
  static async verifyTransaction(
    orderTrackingId: string,
    orderMerchantReference?: string
  ): Promise<PesapalVerificationResult> {
    const res = await fetch('/api/billing/pesapal/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderTrackingId,
        orderMerchantReference,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Payment verification request failed');
    }

    return (await res.json()) as PesapalVerificationResult;
  }

  /**
   * Query status by tracking ID
   */
  static async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const res = await fetch(`/api/billing/pesapal/status/${encodeURIComponent(orderTrackingId)}`);
    if (!res.ok) throw new Error('Failed to query transaction status');
    const data = await res.json();
    return data.data;
  }

  /**
   * Run 15-Point Automated Sandbox & Security Test Suite
   */
  static async runSandboxTests(): Promise<PesapalTestSuiteReport> {
    const res = await fetch('/api/billing/pesapal/sandbox-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Failed to run automated sandbox test harness');
    }

    return (await res.json()) as PesapalTestSuiteReport;
  }

  /**
   * Fetch IPN and payment audit logs
   */
  static async getAuditLogs(): Promise<{ logs: any[]; payments: any[] }> {
    const res = await fetch('/api/billing/pesapal/audit-logs');
    if (!res.ok) return { logs: [], payments: [] };
    return await res.json();
  }

  /**
   * Trigger pending payments reconciliation
   */
  static async runReconciliation(): Promise<any> {
    const res = await fetch('/api/billing/pesapal/reconcile', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Reconciliation failed');
    return await res.json();
  }
}
