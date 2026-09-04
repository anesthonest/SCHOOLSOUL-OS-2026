# SchoolSoul Production Environment Variable Manifest

This document specifies all environment variables utilized across the SchoolSoul operating system.
**CRITICAL SECURITY NOTICE:** Never commit actual secrets or production credentials to source control. Configure these variables strictly within the Render Cloud Service Environment settings dashboard or secure secret manager.

---

## 1. System Runtime & Networking Configuration

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `NODE_ENV` | Sets the application execution mode (`production` or `development`) | **REQUIRED** | SERVER | Render Environment Settings |
| `PORT` | Container binding port for incoming HTTP traffic (default: `10000` on Render) | **REQUIRED** | SERVER | Render Service Port / Auto |
| `APP_URL` | Canonical HTTPS public web origin of the SchoolSoul deployment | **REQUIRED** | SERVER | Render Environment Settings |
| `API_URL` | Canonical HTTPS API base route for callbacks and public references | **REQUIRED** | SERVER | Render Environment Settings |
| `RENDER_EXTERNAL_URL` | Auto-populated by Render runtime representing the public service hostname | **OPTIONAL (AUTO)** | SERVER | Render System Injected |

---

## 2. Security & Authentication Credentials

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `JWT_SECRET` | 256-bit high-entropy secret for signing and verifying user access tokens | **REQUIRED** | SERVER ONLY | Render Environment (Generate) |
| `REFRESH_SECRET` | 256-bit cryptographic secret for issuing rolling refresh session tokens | **REQUIRED** | SERVER ONLY | Render Environment (Generate) |
| `SESSION_SECRET` | Cryptographic secret for signing session state and cookies | **REQUIRED** | SERVER ONLY | Render Environment (Generate) |

---

## 3. Database Persistence

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `DATABASE_URL` | Managed PostgreSQL connection string with SSL enforcement (`postgresql://...`) | **REQUIRED (PROD)** | SERVER ONLY | Render Managed Postgres Linked |

---

## 4. Payment Gateways (Pesapal 3.0 Active Primary | Flutterwave Disabled)

### 4.1 Pesapal 3.0 Payment Gateway (PRIMARY & REQUIRED)

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `PESAPAL_ENVIRONMENT` | Payment target API (`sandbox` for testing or `production` for live billing) | **REQUIRED** | SERVER ONLY | Render Environment Settings |
| `PESAPAL_CONSUMER_KEY` | Merchant consumer key obtained from the Pesapal developer portal | **REQUIRED** | SERVER ONLY | Render Secret Environment |
| `PESAPAL_CONSUMER_SECRET` | Merchant consumer secret obtained from the Pesapal developer portal | **REQUIRED** | SERVER ONLY | Render Secret Environment |
| `PESAPAL_IPN_ID` | Registered IPN Webhook UUID generated via `/api/billing/pesapal/register-ipn` | **REQUIRED** | SERVER ONLY | Render Secret Environment |
| `PAYMENTS_ENABLED` | Master payment switch (`true` to process transactions, `false` to safe-gate) | **REQUIRED** | SERVER ONLY | Render Environment Settings |

### 4.2 Flutterwave Commercial Payment Gateway (DISABLED IN CURRENT PRODUCTION RELEASE)
*Note: Flutterwave is disabled for the current release. The provider abstraction is preserved in codebase for future release phases. Zero Flutterwave variables are required for deployment or startup.*

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `FLW_ENVIRONMENT` | Target API environment (`sandbox` or `production`) | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Environment Settings |
| `FLW_SECRET_KEY` | Flutterwave Secret Key (`FLWSECK_...` or `FLWSECK_TEST_...`) | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Secret Environment |
| `FLW_PUBLIC_KEY` | Flutterwave Public Key (`FLWPUBK_...` or `FLWPUBK_TEST_...`) | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Environment Settings |
| `FLW_ENCRYPTION_KEY` | Encryption Key for payload verification | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Secret Environment |
| `FLW_WEBHOOK_HASH` | Webhook verification secret hash | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Secret Environment |
| `FLW_PAYMENTS_ENABLED` | Flutterwave payment gate switch | **OPTIONAL (DISABLED)** | SERVER ONLY | Render Environment Settings |

---

## 5. Intelligence & Auxiliary Services

| Variable Name | Purpose | Classification | Target Context | Where Configured |
|---|---|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API Key for pedagogical assistance & auto-lesson planning | **OPTIONAL** | SERVER ONLY | Render Secret Environment |
| `DISABLE_WORKER` | Disables background auxiliary scheduled tasks if set to `true` | **OPTIONAL** | SERVER ONLY | Render Environment Settings |

---

## 6. Client-Side Security Assurance
- **Zero Frontend Secrets**: There are NO `VITE_` prefixed secret variables in this repository.
- The client receives only sanitized runtime metadata through authenticated REST API responses (`/api/health`, `/api/school/profile`, `/api/auth/me`).
