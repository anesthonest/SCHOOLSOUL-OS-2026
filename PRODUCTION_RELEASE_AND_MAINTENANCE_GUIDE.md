# Production Release & Maintenance Guide — SchoolSoul OS 2026.1.0

## 1. Release Overview

**Product**: SchoolSoul OS  
**Release Version**: `2026.1.0 Universal Education Release`  
**Target Environment**: Cloud Run / Ubuntu Linux / Node.js 22 LTS / Edge PWA  
**Status**: Certified for Global Production Deployment  

---

## 2. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Tailwind CSS v4, Motion, Lucide Icons, Dexie 4.4 (IndexedDB)
- **Backend**: Node.js Express Server, TypeScript (TSX / esbuild cjs bundle)
- **Database**: PostgreSQL (Cloud SQL) / Local Embedded Store with IndexedDB sync
- **Payment Engine**: Pesapal 3.0 REST Gateway with IPN webhook verification
- **Security**: 4-Layer RBAC, Inactivity Lock Timer (15 min), HMAC-SHA256 QR Signatures, Magic-Byte File Validation
- **Networking**: Bound to `0.0.0.0:3000` behind Nginx reverse proxy

---

## 3. Environment Variables Configuration

Refer to `.env.example` for all configurable environment parameters:

```env
PORT=3000
NODE_ENV=production

# Security Keys
JWT_SECRET=schoolsoul-jwt-secret-key-production-2026
QR_SIGNING_SECRET=schoolsoul-os-2026-qr-signing-key-production

# Pesapal 3.0 Payment Gateway
PAYMENTS_ENABLED=false
PESAPAL_ENV=sandbox
PESAPAL_CONSUMER_KEY=
PESAPAL_CONSUMER_SECRET=
PESAPAL_IPN_ID=
PESAPAL_CALLBACK_URL=http://localhost:3000/api/billing/pesapal/callback

# Gemini AI Assistant
GEMINI_API_KEY=
```

---

## 4. Maintenance & Operations Runbook

### 4.1 Regular Automated Backups
- Database snapshots can be triggered manually in **Level 10: System Administration -> Backup & Restore** or automated via cron.
- Backup files are encrypted and include student records, fee ledgers, exam grades, and system audit trails.

### 4.2 QR Key Rotation
- To rotate institutional QR signing keys, navigate to the **School QR Code modal** (or trigger via API `POST /api/qr/rotate-school-qr`) and click **Rotate Security Signature**.
- Immediately logs an audit record and refreshes all visual QR assets across the system.

### 4.3 Running System Diagnostic Tests
Execute the full test suite in terminal:
```bash
npm test
```
Runs 48 acceptance, security, naming, payment, and QR isolation checks.

### 4.4 Starting the Application
```bash
# Development Mode:
npm run dev

# Production Build:
npm run build

# Production Start:
npm run start
```
