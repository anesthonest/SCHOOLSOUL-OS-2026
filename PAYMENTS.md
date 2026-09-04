# SchoolSoul Payment Gateway Architecture
## Production Lock: Pesapal 3.0 (Active & Primary) | Flutterwave (Disabled / Preserved Abstraction)

### 1. Architectural Overview & Production State
SchoolSoul employs a resilient, provider-agnostic payment architecture designed for African and global educational institutions. For the current production release, **PESAPAL 3.0 is the active, primary, and required payment provider**. 

Flutterwave is currently **DISABLED** for production deployment; its provider abstraction and interfaces remain fully preserved in code for future multi-gateway expansion without introducing startup dependencies or requiring Flutterwave environment variables.

```
+-------------------------------------------------------------------------+
|                           SchoolSoul Client                             |
|               (Unified Checkout UI / Dynamic Method Selector)           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                     PaymentRoutingService (Server)                      |
|        - Country-Aware Provider Routing (Uganda, Kenya, Tanzania, etc.) |
|        - Strict Per-School Gateway Toggles & Tenant Isolation           |
|        - Production Gate: Resolves strictly to PESAPAL 3.0              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        PesapalPaymentProvider (3.0)                     |
|        - Official API 3.0 OAuth Token Flow & IPN Notifications          |
|        - Native East African Mobile Money (MTN MoMo, Airtel, M-Pesa)    |
|        - 3D-Secure 2.0 Visa & Mastercard Processing                     |
|        - Idempotent Server-to-Server Verification                       |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  Authoritative Ledger & Receipt Engine                  |
|        - Server-Side SHA-256 Cryptographic Receipt Signature            |
|        - Zero-Trust State Transition (Only on verified server callback) |
|        - Strict Multi-Tenant Isolation (School A != School B)           |
+-------------------------------------------------------------------------+
```

---

### 2. Provider Abstraction Interface (`PaymentProvider`)
All payment gateways in SchoolSoul implement the unified `PaymentProvider` interface defined in `/server/services/paymentTypes.ts`:

- `createPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse>`
- `verifyPayment(merchantReference: string, providerReference?: string): Promise<UnifiedVerificationResult>`
- `handleWebhook(headers: Record<string, string | string[] | undefined>, body: any): Promise<UnifiedWebhookResult>`
- `refundPayment(transactionId: string, amount?: number, reason?: string): Promise<UnifiedRefundResult>`
- `getPaymentStatus(merchantReference: string): Promise<UnifiedVerificationResult>`
- `validateAmount(amount: number): boolean`
- `validateCurrency(currency: string): boolean`
- `validateReference(reference: string): boolean`
- `getSupportedCurrencies(): string[]`
- `getSupportedPaymentMethods(countryCode: string, currency: string): UnifiedPaymentMethod[]`
- `getHealthStatus(): Promise<{ status: string; environment: string; isConfigured: boolean; ... }>`

---

### 3. Country-Aware Routing & Coverage Matrix

| Country | Primary Gateway | Alternate / Fallback | Local Methods Supported |
|---|---|---|---|
| **Uganda (UG)** | Flutterwave / Pesapal | Seamless Failover | MTN MoMo (*165#), Airtel Money (*185#), Visa, Mastercard |
| **Kenya (KE)** | Pesapal | Flutterwave | Safaricom M-PESA Paybill, Airtel Money Kenya, Cards |
| **Tanzania (TZ)** | Pesapal | Flutterwave | Vodacom M-Pesa, Tigo Pesa, Airtel Money, Cards |
| **Rwanda (RW)** | Flutterwave | Pesapal | MTN Mobile Money (*182#), Airtel Money Rwanda |
| **Nigeria (NG)** | Flutterwave | Bank Wire | NIBSS Bank Transfer, USSD (*737#), Flutterwave Card |
| **Ghana (GH)** | Flutterwave | - | MTN Mobile Money Ghana, Telecel Cash, Card |
| **Zambia (ZM)** | Flutterwave | - | MTN MoMo (*303#), Airtel Money Zambia |
| **South Africa (ZA)** | Flutterwave | Stripe | Ozow Instant EFT, Capitec Pay, Credit Card |
| **Global / International** | Flutterwave / Pesapal | Stripe / SWIFT | Visa, Mastercard, American Express, Wire Settlement |

---

### 4. Security Rules & Zero-Trust Validation
1. **Server-Side Exclusivity**: Secrets (`FLW_SECRET_KEY`, `PESAPAL_CONSUMER_SECRET`, `FLW_WEBHOOK_HASH`) NEVER reach browser JavaScript.
2. **Authoritative Calculation**: All amounts and tax rates are determined strictly on the backend via the country pricing matrix.
3. **Zero-Trust Callbacks**: Incoming webhook payloads are NEVER trusted at face value. The server performs an independent GET / POST verification request directly to the payment gateway API before updating invoice or subscription status.
4. **Webhook Signature Authentication**:
   - Flutterwave: Checked against `verif-hash` header using constant-time comparison.
   - Pesapal: Checked against registered IPN endpoints with transaction tracking query.
5. **Idempotency Locks**: Duplicate webhooks or callback triggers are safely deduped to prevent duplicate balance credits or multiple receipt generations.
6. **Tenant Isolation**: Every transaction record contains `schoolId`. Cross-tenant queries are blocked with 403 Forbidden.

---

### 5. API Endpoints Reference

#### Multi-Gateway Routing
- `GET /api/billing/gateways/available?countryCode=UG&currency=UGX` — List active gateways and available payment methods.
- `POST /api/billing/checkout/initiate` — Unified checkout session with automatic fallback.
- `GET /api/billing/settings/gateways` — Get school gateway configuration.
- `POST /api/billing/settings/gateways` — Update school gateway configuration.

#### Flutterwave Endpoints
- `GET /api/billing/flutterwave/health` — Health check & configuration status.
- `POST /api/billing/flutterwave/order` — Create Flutterwave payment order.
- `POST /api/billing/flutterwave/verify` — Authoritative verification of Flutterwave transaction.
- `POST /api/billing/flutterwave/webhook` — Flutterwave webhook receiver.
- `POST /api/billing/flutterwave/sandbox-test` — 15-Point automated sandbox test harness.

#### Pesapal Endpoints
- `GET /api/billing/pesapal/health` — Health check & configuration status.
- `POST /api/billing/pesapal/order` — Create Pesapal 3.0 order.
- `POST /api/billing/pesapal/verify` — Authoritative verification of Pesapal transaction.
- `POST & GET /api/billing/pesapal/ipn` — Pesapal IPN webhook receiver.
- `POST /api/billing/pesapal/sandbox-test` — 15-Point automated sandbox test harness.
