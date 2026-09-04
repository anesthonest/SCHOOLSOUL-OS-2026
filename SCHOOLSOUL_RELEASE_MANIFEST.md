# SchoolSoul OS — Final Release Manifest

## Release Metadata
- **Application Name**: SchoolSoul Operating System (SchoolSoul OS)
- **Release Version**: `6.0.0-RELEASE-CANDIDATE`
- **Schema Version**: `2026.6.0`
- **Build Identifier**: `SS-V6-RC-20260902`
- **Freeze Status**: `LOCKED`
- **Node Runtime**: Node.js v20.x / v22.x LTS
- **Package Manager**: npm / bun
- **Deployment Platform**: Render Cloud / Container Ingress (Web Service + Managed PostgreSQL 16)

---

## Technical Stack Specifications

### 1. Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Bundler & Tooling**: Vite 6+
- **Styling**: Tailwind CSS with custom responsive breakpoints (Mobile 375px, Tablet 768px, Desktop 1280px, Ultrawide 1920px)
- **Animation**: Motion (via `motion/react`)
- **Iconography**: Lucide React
- **Local Persistence & Sync**: IndexedDB / LocalStorage offline caching queue

### 2. Backend & Server Engine
- **Server Framework**: Node.js Express 4.x with Native TypeScript Execution (`tsx`) & esbuild bundling
- **API Architecture**: Modular REST endpoints with prefix `/api/*`
- **Security Middleware**: Helmet security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`), sliding window rate limiting (`express-rate-limit` equivalent), and tenant isolation guards

### 3. Identity, Authentication & RBAC
- **Password Encryption**: OWASP-compliant Argon2id cryptographic hashing (64MB memory cost, 3 iterations) with automated backwards-compatible bcrypt migration
- **Session Tokens**: JWT (JSON Web Tokens) with 8-hour access lifetime and 7-day rolling refresh tokens
- **Role-Based Access Control (RBAC)**: Strict server-side verification across 6 primary roles:
  1. `Administrator` / `School Owner` (Full governance, backups, audit trails)
  2. `Director of Studies (DOS)` / `Headteacher` (Curriculum, timetable, academic performance)
  3. `Teacher` / `Class Teacher` (Attendance, assignments, marks, live classroom hosting)
  4. `Bursar` / `Accountant` (Ledger, tuition invoicing, Pesapal payment processing)
  5. `Parent` / `Guardian` (Linked-child academic reports, fee balance statements)
  6. `Student` (Learning modules, project portfolio submissions, club discussions)

### 4. Database & Storage Architecture
- **Primary Database Engine**: Managed PostgreSQL 16 with SSL enforcement (`sslmode=require`), connection pooling (`pg.Pool`), and atomic upserts
- **Local/Fallback Persistence**: Multi-tenant synchronous memory/JSON persistent store (`server/db/store.ts`) for resilient offline school server deployments
- **Database Safety**: Non-destructive schema initialization (`CREATE TABLE IF NOT EXISTS`, zero destructive drop/truncate scripts)
- **Point-in-Time Backups**: Encrypted JSON snapshots with SHA-256 integrity checksums and complete entity graph restoration

### 5. Financial & Payment Gateway Integration
- **Provider**: Pesapal 3.0 Commercial API
- **Supported Payment Methods**: Mobile Money (MTN MoMo, Airtel Money, M-Pesa), Visa, Mastercard, Bank Transfer
- **Security Features**: Server-side token caching, cryptographic signature generation, Instant Payment Notification (IPN) webhook verification, duplicate transaction deduplication, and zero frontend secret exposure
- **Safety Gate**: `PAYMENTS_ENABLED` toggle prevents accidental live charges during sandbox testing

### 6. Offline & Sync Engine
- **Local Caching**: IndexedDB offline buffer for low-connectivity environments
- **Sync Protocol**: Bidirectional conflict-resolved sync endpoints (`/api/sync/pull`, `/api/sync/push`) with role-based mutation validation and audit trails

### 7. Digital Safeguarding & Live Learning
- **Community Channels**: Anti-bullying keyword filter and institutional moderator review workflows
- **Live Classrooms**: WebRTC peer-to-peer audio/video streaming, collaborative whiteboard state, and teacher-controlled participant admissions

---

## Required Environment Variables Summary
- `NODE_ENV` (Set to `production`)
- `PORT` (Container ingress port, default `10000`)
- `APP_URL` & `API_URL` (Canonical HTTPS domain)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET`, `REFRESH_SECRET`, `SESSION_SECRET` (Cryptographic signing keys)
- `PESAPAL_ENVIRONMENT`, `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_IPN_ID`, `PAYMENTS_ENABLED` (Payment gateway)
- `GEMINI_API_KEY` (Pedagogical AI intelligence)

---

## Known Operational Considerations & Architecture Requirements
1. **Live Teaching WebRTC Networking**: Direct peer-to-peer WebRTC is supported for local school LANs and low-NAT networks. For wide-area internet live video crossing symmetric enterprise NATs/firewalls, standard external STUN/TURN server URLs should be provisioned in the WebRTC RTCPeerConnection configuration.
2. **Media Storage**: Uploaded files and photos are stored in PostgreSQL/persistent volumes. For massive multi-terabyte school video archives, external S3-compatible cloud object storage (e.g. Cloudflare R2 / AWS S3) can be attached.
3. **Payments Activation**: Pesapal credentials must be verified in the Pesapal Merchant Portal and registered via `/api/billing/pesapal/register-ipn` before setting `PAYMENTS_ENABLED="true"`.
