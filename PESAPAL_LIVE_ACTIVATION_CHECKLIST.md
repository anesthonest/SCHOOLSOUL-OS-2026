# SCHOOLSOUL OS 2026.1.0
## PESAPAL 3.0 LIVE ACTIVATION CHECKLIST & PRODUCTION GATE

**Gateway Integration:** Pesapal API 3.0 REST Engine  
**Release Target:** SchoolSoul OS 2026.1.0 Production Candidate  
**Active Payment Provider:** PESAPAL ONLY (Flutterwave Permanently Locked & Disabled)  
**Current Safety Gate:** `PAYMENTS_ENABLED=false` (Controlled Activation Gate)

---

### Production Activation Checklist

- [x] **Production credentials structure configured** (Server-side environment variables defined in Render blueprint)
- [x] **Production authentication architecture verified** (OAuth2 token acquisition & in-memory short-lived caching)
- [x] **IPN endpoint configured** (`/api/billing/pesapal/ipn` registered with instant webhook listener)
- [x] **IPN verified** (Idempotency deduplication, replay attack rejection & HMAC verification active)
- [x] **Callback endpoint configured** (`/billing/pesapal/callback` route mounted)
- [x] **Callback HTTPS enforced** (Production routing requires TLS 1.3 / HTTPS public URL)
- [x] **Callback verified** (Callback triggers independent server-side status inquiry rather than trusting client)
- [x] **Server-side verification verified** (Authoritative polling of Pesapal status codes: 1=COMPLETED, 2=FAILED, 3=REVERSED)
- [x] **Amount verification verified** (Strict match between order invoice amount and Pesapal settled amount; rejects discrepancies > 0.01)
- [x] **Currency verification verified** (Strict ISO 4217 validation matching institutional school country configuration, e.g., UGX)
- [x] **Idempotency verified** (Unique merchant references `SS-UG-SCH...` and duplicate IPN transaction deduplication)
- [x] **Duplicate protection verified** (Double-click protection, transaction locking, single receipt issuance)
- [x] **Tenant isolation verified** (School A cannot view, query, or settle School B payments or invoices)
- [x] **RBAC verified** (Restricted roles cannot initiate administrative subscription payments or view gateway secrets)
- [x] **Card workflow verified** (Routes to Pesapal 3D-Secure without capturing or storing card details on SchoolSoul)
- [x] **Mobile-money workflow verified** (MTN MoMo and Airtel Money phone inputs with E.164 normalization, isolated from card flow)
- [x] **Order workflow verified** (School Market order state machine: PENDING -> PAID -> PROCESSING -> READY -> COMPLETED)
- [x] **Subscription workflow verified** (Institutional subscription tier activation and extension upon server receipt confirmation)
- [x] **Receipt workflow verified** (Official cryptographic receipt generation with SHA-256 digital signature)
- [x] **Failure handling verified** (Failed/cancelled payments preserve pending invoice state without crashing UI or leaking stack traces)
- [x] **Security tests passed** (Zero SQL injection, path traversal sanitized, magic byte validation on media, PII masked)
- [x] **Render configuration verified** (`render.yaml` blueprint with PostgreSQL, health probe `/health`, Node.js 18+ runtime)
- [x] **Flutterwave disabled** (Status: `DISABLED / NOT REQUIRED`; zero startup dependency)
- [x] **PAYMENTS_ENABLED still false** (Preserved in safe state until explicit platform-owner live authorization)

---

### Verification Summary
All functional, security, and routing checks for Pesapal 3.0 have passed in Sandbox Validation Mode. The system is structurally and logically ready for live activation upon platform-owner provisioning of production merchant credentials.
