# SchoolSoul OS 2026.1.0 – Final Data Ownership & RBAC Matrix

**Date:** 2026-08-26  
**Audited By:** Security & System Architecture Engineering  
**Scope:** Verification of the 4-layer Role-Based Access Control (RBAC) model, tenant isolation by `schoolId`, permission enforcement across routes and API endpoints, and data ownership boundaries.

---

## 1. The 4-Layer RBAC Architecture

SchoolSoul OS implements a multi-layer defense-in-depth authorization model configured in `/src/security/accessControl.ts` and managed via `/src/context/AuthContext.tsx`:

1. **Layer 1: Navigation & Route Guarding** – Non-authorized modules are hidden from navigation and inaccessible via direct URL routing.
2. **Layer 2: UI Component & Action Gates** – Edit, Delete, Export, and Approve buttons are conditionally rendered via `hasPermission(resource, action)`.
3. **Layer 3: Store & Service-Level Gatekeeping** – APIs validate user identity, school tenancy (`schoolId`), and role capability prior to executing IndexedDB or backend requests.
4. **Layer 4: Immutable Audit Trail** – All data mutations log the acting operator ID, username, role, action type, and detailed description.

---

## 2. Institutional Role Permissions & Data Ownership Matrix

| System Domain / Resource | Super Admin | Administrator / Headteacher | Director of Studies (DOS) | Subject Teacher | Bursar / Accountant | Registrar / Admissions | Gate Security | Student / Parent |
|---|---|---|---|---|---|---|---|---|
| **School Settings & Tenancy** | **Full** | **Manage** | View | View | View | View | None | None |
| **User & Role Management** | **Full** | **Manage** | View | None | None | None | None | None |
| **Timetable Master** | **Full** | **Manage** | **Manage** | View (Self) | None | View | None | View (Self) |
| **Academic Calendar** | **Full** | **Manage** | **Manage** | View | View | View | View | View |
| **Classes & Subjects** | **Full** | **Manage** | **Manage** | View | None | View | None | View |
| **Assessments & Marks** | **Full** | **Review/Approve** | **Manage** | **Edit (Assigned)** | None | View | None | View (Report Card) |
| **Homework & Diary** | **Full** | **Manage** | **Manage** | **Create/Edit** | None | None | None | View & Submit |
| **Staff HR & Payroll** | **Full** | **Manage** | View | None | **Financials** | None | None | None |
| **Staff Leave Requests** | **Full** | **Approve/Reject** | View | **Apply** | View | View | None | None |
| **Student 360 & Biodata** | **Full** | **Manage** | **Manage** | View / Notes | View (Fees) | **Create/Edit** | QR Verify | View (Self) |
| **Visitor Gate Pass** | **Full** | **Manage** | None | None | None | None | **Check-In/Out** | None |
| **Fee Collection / Pesapal** | **Full** | **Manage** | None | None | **Manage** | View | None | Pay / Receipt |

---

## 3. Multi-Tenant Isolation by `schoolId`

- **Tenant Scoping:** All IndexedDB queries, storage keys, and API calls automatically scope queries with the active tenant identifier `schoolId`.
- **Cross-Tenant Leakage Prevention:** Data belonging to School A is structurally inaccessible to authenticated users from School B.
- **Export & Backup Sanitization:** Database export routines preserve tenant headers and strip unencrypted session secrets.
