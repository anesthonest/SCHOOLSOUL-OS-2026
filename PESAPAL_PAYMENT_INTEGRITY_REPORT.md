# Pesapal 3.0 Payment Integrity Report — SchoolSoul OS 2026.1.0

## 1. Executive Summary

SchoolSoul OS 2026.1.0 maintains a dedicated **Pesapal 3.0-Only** payment architecture for all live digital payments across East and Central Africa (Uganda, Kenya, Tanzania, Rwanda).

---

## 2. Key Architecture Directives & Constraints

1. **Pesapal-Only Gateway**: All digital payments are processed through official Pesapal 3.0 REST APIs (`/api/billing/pesapal/submit-order`, IPN notifications, and status polling).
2. **Flutterwave Disabled**: Flutterwave remains disabled in configuration and code.
3. **Safety Killswitch**: `PAYMENTS_ENABLED=false` is enforced by default in the codebase. Live payment submission is deactivated unless the platform owner explicitly configures live production API credentials (`PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_IPN_ID`) and sets `PAYMENTS_ENABLED=true`.
4. **Offline Manual Payments Supported**: Even with digital payments disabled, schools can record offline cash, bank deposit slips, and manual receipts with complete audit tracking.

---

## 3. Pesapal 3.0 Payment Lifecycle

```
[Parent / Student Fee Account]
              │
              ▼
1. Initiate Order Request (`POST /api/billing/pesapal/submit-order`)
              │
              ├─ Validates schoolId, studentId, and fee breakdown
              ├─ Fetches OAuth2 Bearer Token from Pesapal Auth API
              └─ Returns Pesapal `redirect_url` and `order_tracking_id`
              │
              ▼
2. Parent Completes Payment on Pesapal Gateway (MTN MoMo / Airtel Money / Visa / Mastercard)
              │
              ▼
3. Instant Payment Notification (IPN) (`GET/POST /api/billing/pesapal/ipn`)
              │
              ├─ Verifies IPN Notification Type and tracking ID
              ├─ Calls Pesapal Transaction Status API (`/api/Transactions/GetTransactionStatus`)
              ├─ Idempotent ledger update (prevents double crediting)
              └─ Automatically generates digital receipt with tamper-proof QR code
```

---

## 4. Test Suite Audit Results

The Pesapal 3.0 production test matrix passed with 100% compliance:
- `OAuth2 Token Acquisition & Caching`: **PASS**
- `Order Registration & Tracking ID Generation`: **PASS**
- `IPN Callback Verification & Idempotency`: **PASS**
- `Safety Killswitch Guard`: **PASS** (`PAYMENTS_ENABLED=false` blocks unauthorized live charge calls)
- `Offline Cash & Bank Receipt Generation`: **PASS**
