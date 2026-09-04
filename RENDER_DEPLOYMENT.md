# SchoolSoul Render Cloud Production Deployment Guide

## 1. Overview & Architecture

SchoolSoul is architected for single-service full-stack deployment on **Render Cloud**, combining an Express API engine with a high-performance React SPA bundle, connected directly to a managed **Render PostgreSQL** database and the **Pesapal API 3.0** payment gateway.

```
                    INTERNET (Public Traffic)
                              │
                              ▼
                https://your-school-domain.com
                              │
                            HTTPS
                              │
                              ▼
                RENDER WEB SERVICE (Node.js)
                 ├── Express API Engine
                 ├── Dynamic Port Binding (process.env.PORT)
                 ├── Security Headers & JWT Auth
                 ├── Background Reconciliation Worker
                 └── Static React SPA Client (/dist)
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
   RENDER POSTGRESQL                     PESAPAL API 3.0
   (Managed Database)                   (Payment Rails)
   - Connection Pooling                  - IPN Webhooks
   - Multi-Tenant Isolation              - MoMo & Card Settlement
   - Auto-Migrated Tables                - Status Verification
```

---

## 2. Render Blueprint & Provisioning

SchoolSoul includes a production-ready `render.yaml` Blueprint file.

### Step 1: Deploy with Blueprint
1. Connect your Git repository to Render.
2. In the Render Dashboard, select **New** > **Blueprint**.
3. Select the repository containing `render.yaml`.
4. Render will automatically detect and configure:
   - **Web Service**: `schoolsoul-web` (Node runtime)
   - **PostgreSQL Database**: `schoolsoul-postgres` (PostgreSQL 16)
   - Auto-generated secrets for `JWT_SECRET`, `REFRESH_SECRET`, and `SESSION_SECRET`.

---

## 3. Environment Variables Configuration

Set these variables in the Render Dashboard (**Environment** tab):

| Variable | Recommended Initial Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizers & suppresses stack traces |
| `DATABASE_URL` | Auto-populated by Render | Managed PostgreSQL connection string with SSL |
| `APP_URL` | `https://your-service.onrender.com` | Canonical public HTTPS base URL |
| `API_URL` | `https://your-service.onrender.com` | Canonical API base URL |
| `JWT_SECRET` | Auto-generated | 64-character random secret |
| `PESAPAL_ENVIRONMENT` | `sandbox` | Start with `sandbox`, switch to `production` after verification |
| `PESAPAL_CONSUMER_KEY` | *(From Pesapal Portal)* | Merchant Consumer Key |
| `PESAPAL_CONSUMER_SECRET`| *(From Pesapal Portal)* | Merchant Consumer Secret |
| `PESAPAL_IPN_ID` | *(Captured in Step 4)* | Registered IPN Notification ID |
| `PAYMENTS_ENABLED` | `false` (initially) | Set `true` after verifying Sandbox IPN & callback |
| `GEMINI_API_KEY` | *(Optional)* | Server-side Gemini AI intelligence key |

---

## 4. Pesapal IPN Registration Workflow

1. Once the Render service is live at `https://your-service.onrender.com`:
2. Call the IPN registration endpoint (via API or the in-app **Pesapal 3.0 Gateway Cockpit**):
   ```bash
   POST https://your-service.onrender.com/api/billing/pesapal/register-ipn
   ```
3. Copy the returned `ipn_id` (e.g., `8d29fb91-....`).
4. In Render Dashboard, set `PESAPAL_IPN_ID = <returned_ipn_id>`.
5. Enable payments by setting `PAYMENTS_ENABLED = true`.

---

## 5. Health & Readiness Probes

Render automatically monitors service health using configured endpoints:
- **Liveness Probe**: `GET /health` (returns uptime, memory, version, database status)
- **Readiness Probe**: `GET /ready` (validates database connectivity before routing user traffic)
- **Pesapal Health**: `GET /api/payments/pesapal/health` (evaluates OAuth tokens, credentials, and IPN readiness)

---

## 6. Build & Start Commands

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Host Binding**: `0.0.0.0`
- **Port**: Dynamically bound via `process.env.PORT`
