# SCHOOLSOUL OS 2026.1.0
## OWNERSHIP, AUTHORSHIP & PROVENANCE RECORD

**Product:** SchoolSoul OS  
**Current Release Version:** 2026.1.0  
**Project Attribution:** VINEXSAH TECHNOLOGIES project  
**Current Copyright Notice:** © 2026 SchoolSoul OS. All Rights Reserved.  
**Legal Notice:** VINEXSAH TECHNOLOGIES is currently a project/business name pending formal registration.  

---

### 1. Product Identity & Origin Overview

- **Product Name:** SchoolSoul OS
- **System Architecture:** Offline-first, multi-tenant digital school operating system for African educational institutions.
- **Core Technology Stack:** React 19, TypeScript, Tailwind CSS, Express REST API, IndexedDB (Dexie), PostgreSQL / In-Memory Dual Store Engine, Pesapal API 3.0 Gateway.
- **Project Initiative:** Developed under the **VINEXSAH TECHNOLOGIES** project as an integrated operating environment for K-12 and tertiary schools across Uganda and Sub-Saharan Africa.
- **Current Legal Status:** Project / business name pending formal legal entity registration. No registered trademark, patent, or incorporation certificate is claimed in this record.

---

### 2. Development Evidence Categories & Repositories

| Evidence Category | Description & Technical Location | Verification Status |
| :--- | :--- | :--- |
| **Source Code** | `/src` (Frontend 128 views, 76 navigation routes), `/server` (68 REST APIs, Express middlewares, dual data store) | **VERIFIED** |
| **System Blueprints & Specs** | `FINAL_SCHOOLSOUL_COMPLETENESS_MATRIX.md`, `FINAL_NAVIGATION_MATRIX.md`, `FINAL_WORKFLOW_INTEGRITY_MATRIX.md` | **VERIFIED** |
| **UI & UX Architecture** | Accessible, responsive single-page application with dark/light themes and Lucide vector icons | **VERIFIED** |
| **Database Schemas & Models** | `/server/db/store.ts`, `/server/db/postgresStore.ts`, `/src/db/indexedDB.ts` (38 data collections, 112 operations) | **VERIFIED** |
| **Security Architecture** | 7-tier RBAC (`/src/security/accessControl.ts`), JWT session auth, Argon2id password hashing, multi-tenant isolation | **VERIFIED** |
| **Payment Architecture** | `/server/services/pesapalService.ts` (Pesapal API 3.0 exclusive gateway, `PAYMENTS_ENABLED=false` safety gate, Flutterwave disabled) | **VERIFIED** |
| **School Market Engine** | `/server/services/marketFeeEngine.ts` (50/100/150 UGX transaction fee tier split, buyer PIN pickup fulfillment) | **VERIFIED** |
| **Automated Test Suites** | `/server/tests/runAcceptanceSuite.ts`, `/server/tests/testPesapalProduction.ts`, `/server/tests/testMarketMediaSuite.ts` (34/34 passing) | **VERIFIED** |
| **Audit & Release Logs** | `FINAL_SYSTEM_GAP_ANALYSIS.md`, `FINAL_SYSTEM_REPAIR_LOG.md`, `FINAL_PESAPAL_ONLY_INTEGRITY_REPORT.md` | **VERIFIED** |
| **Deployment Specifications** | `render.yaml`, `package.json`, `.env.example` | **VERIFIED** |

---

### 3. Evidentiary Preservation Principles

1. **Defensible Technical Trail:** All source files, configuration manifests, and test runs are cryptographically fingerprinted with SHA-256 hashes in `SCHOOLSOUL_SOURCE_INTEGRITY_MANIFEST.json`.
2. **Third-Party Boundary:** Clear legal and architectural boundaries are maintained between proprietary SchoolSoul logic and open-source dependencies (e.g., React, Express, Lucide, Tailwind).
3. **User & School Data Separation:** SchoolSoul OS claims no ownership of student academic data, photographs, video assets, school fee ledgers, or user-generated marketplace listings. Institutional data remains the property of the respective tenant institution.
