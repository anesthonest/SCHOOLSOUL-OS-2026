# School QR Code Isolation & Tenant Security Report

## 1. Multi-Tenant QR Architecture

In SchoolSoul OS 2026.1.0, every education institution is provisioned with a mathematically unique, cryptographically signed **School QR Identity**. This identity is strictly partitioned to prevent cross-school data leakage, credential spoofing, and unauthorized data queries.

---

## 2. Cryptographic Signature & Invalidation Engine

### 2.1 Signature Generation
Institutional signatures are generated using server-side HMAC-SHA256:
$$\text{Signature} = \text{HMAC-SHA256}(\text{Secret}, \text{schoolId} \parallel \text{timestamp})[0..16]$$
- Key material is isolated from client browsers and resides exclusively on the server (`process.env.QR_SIGNING_SECRET`).
- The payload includes `schoolId`, `code`, `sig`, and `version`.

### 2.2 Zero-Downtime Key Rotation
Administrators (Headteachers / System Admins) can rotate institutional QR keys on demand via `POST /api/qr/rotate-school-qr`:
1. Old signature is immediately revoked and marked in the database.
2. A new HMAC signature is calculated with a high-resolution timestamp.
3. An audit log entry (`QR_IDENTITY_ROTATED`) is permanently committed.
4. Old printed physical badges remain verifiable for legacy audit if enabled by policy, but cannot be used for administrative authorization.

---

## 3. Cross-School Breach Defense Matrix

| Attack Vector | System Defense Mechanism | Verification Status |
| :--- | :--- | :--- |
| **Foreign School Badge Scan** | `/api/qr/verify` verifies `payload.schoolId === session.schoolId`. If different, returns `403 CROSS_SCHOOL_BREACH` and logs security alert. | **PASS (Blocked)** |
| **Forged Signature Attack** | Server re-calculates HMAC signature with server secret. Non-matching signatures return `400 SIGNATURE_INVALID`. | **PASS (Blocked)** |
| **Student ID Cross-Lookup** | Queries for student records are strictly scoped: `SELECT * FROM students WHERE id = ? AND schoolId = ?`. | **PASS (Enforced)** |
| **Replay & Rate Limiting** | In-memory sliding window limiter caps scan verification to 120 requests/min per IP. | **PASS (Enforced)** |

---

## 4. Audit Log Integration

Every QR verification attempt logs the following immutable fields:
- `id`: Unique UUID
- `schoolId`: Host institution ID
- `timestamp`: ISO-8601 UTC timestamp
- `scannedType`: Workflow classification (`SCHOOL_IDENTITY`, `STUDENT_PASSPORT`, etc.)
- `status`: `VERIFIED` | `FAILED` | `CROSS_SCHOOL_BLOCKED` | `EXPIRED` | `TAMPERED`
- `scannedByUserId` / `scannedByRole`: Authenticated operator details
- `deviceContext`: User agent and terminal identifier
