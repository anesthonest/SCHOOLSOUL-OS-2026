# Universal QR System Report — SchoolSoul OS 2026.1.0

## 1. System Overview

SchoolSoul OS 2026.1.0 integrates a multi-workflow Universal QR Code Infrastructure designed for education institutions operating in both online cloud and offline-first edge environments.

The QR system powers four workflows:
1. **School-Specific Institutional Identity (`SCHOOL_IDENTITY`)**: Cryptographically signed official institutional QR badge used for parent onboarding, transfer verification, accreditation checks, and inter-school document exchange.
2. **Student Passport Verification (`STUDENT_PASSPORT`)**: Instant physical and digital ID card scanning for attendance registers, gate security, library book checkout, exam room entry, and clinic visits.
3. **School Market & Canteen Pickup (`MARKET_PICKUP`)**: Tamper-proof tokenized order verification for student and staff merchandise pickup.
4. **Credential & Certificate Authentication (`CREDENTIAL_AUTHENTICATION`)**: Publicly verifiable graduation transcripts, achievement awards, and digital badges with SHA-256 integrity verification.

---

## 2. Universal Scanner Architecture

### 2.1 Multi-Mode Capture
The `UniversalQRScannerModal` (`/src/components/common/UniversalQRScannerModal.tsx`) supports 3 capture mechanisms:
- **Live Video Camera Feed**: Utilizing browser `navigator.mediaDevices.getUserMedia` with automatic environment facing mode (`facingMode: 'environment'`) and real-time optical decoding via `jsqr` running in a 100ms `requestAnimationFrame` loop.
- **Image File Upload**: Drag-and-drop or file picker accepting PNG, JPEG, WebP, or GIF images, rendered to an off-screen HTML5 `<canvas>` for decoding.
- **Manual Code / Payload Entry**: Fallback text input allowing direct manual entry of ID numbers or QR token strings for low-end hardware or damaged cameras.

### 2.2 Server-Authoritative Verification
Client-side optical decoding merely extracts the payload string. Authorization and data resolution are executed by `/api/qr/verify` (`/server/routes/qr.ts`), enforcing:
- Request validation and payload type recognition.
- Rate limiting (maximum 120 verification requests per minute per IP).
- Tenant isolation and cross-school boundary enforcement.
- Immutable audit logging of all scan attempts into `auditLogs`.

---

## 3. Supported Workflows & Payloads

| Workflow Type | Payload Schema Sample | Resolution Action |
| :--- | :--- | :--- |
| `SCHOOL_IDENTITY` | `{"type":"SCHOOL_IDENTITY","schoolId":"school-ug-001","sig":"A1B2C3D4E5F6"}` | Validates cryptographic signature against active institution key, displays school profile, status, and curriculum. |
| `STUDENT_PASSPORT` | `{"type":"STUDENT_PASSPORT","schoolId":"school-ug-001","studentId":"LIN-2026-1042"}` | Resolves full student passport, photo, guardian details, and active attendance record. |
| `MARKET_PICKUP` | `{"type":"MARKET_PICKUP","schoolId":"school-ug-001","orderNumber":"ORD-001","token":"..."}` | Validates paid order status, displays line items, decrements inventory, and marks order collected. |
| `CREDENTIAL_AUTHENTICATION` | `{"type":"CREDENTIAL_AUTHENTICATION","schoolId":"...","code":"CERT-889"}` | Verifies transcript/certificate authenticity against issuer records. |

---

## 4. Verification Results

All unit and acceptance tests for the Universal QR System passed:
- `Cryptographic Signature Engine`: **PASS** (HMAC-SHA256 16-char hex signature verified).
- `Cross-School Boundary Isolation`: **PASS** (Foreign school QR access rejected).
- `Student Passport Resolution`: **PASS** (Correct tenant resolution).
- `Marketplace Order Fulfillment`: **PASS** (Order token verification verified).
- `Malformed Payload Rejection`: **PASS** (4/4 invalid inputs rejected).
