# SCHOOLSOUL OS 2026.1.0
## FINAL ROLE & PERMISSION (RBAC) ACCESS CONTROL MATRIX

**Release Candidate:** SchoolSoul OS 2026.1.0  
**Security Module:** `src/security/accessControl.ts` & `server/middleware/*`  
**Standard:** 7 Hierarchical & Functional Roles with Multi-Tenant Isolation and Route Guards

---

### Master RBAC Matrix

| Role Key | Role Display Name | Access Scope / Level | Modules Permitted | Restricted / Forbidden Modules | Route Guard Enforcement | API Middleware Enforcement | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Super Administrator (VINEXSAH) | Full Platform Master Control | All 128 views & system settings | None | Global wildcard bypass | `requireSuperAdmin` | **PASS** |
| **`HEADTEACHER`** | Headteacher / Principal / Director | School Executive & Operations | Core, Academics, Finance, Ops, Comms, Welfare, HR, Intelligence, Market, Opps | Server internals, System-wide cross-tenant settings | Role check on system views | `requireAdmin`, Tenant isolation | **PASS** |
| **`BURSAR`** | Bursar / Chief Accountant | Finance & Commercial Engine | Finance Hub, Fees, Payments, Budgets, Invoices, School Market, Sponsorship | Academics grade edits, Student safeguarding confidential cases | Blocked on Academics & Safeguarding | `requireBursar`, Tenant isolation | **PASS** |
| **`DIRECTOR_OF_STUDIES`** | Director of Studies (DOS) | Academic & Examinations Engine | Academics, Timetable, Subjects, Gradebook, Report Cards, Transcripts, Attendance | Financial cashbook modifications, System user management | Blocked on Financial ledgers & System users | `requireDOS`, Tenant isolation | **PASS** |
| **`TEACHER`** | Class & Subject Teacher | Classroom & Student Engagement | Attendance Roll-Call, Lesson Planner, Homework, Gradebook, Live Learning, Comms | Fee structure edits, Financial reports, System configurations | Blocked on Finance & Administration | `requireTeacher`, Class assignment check | **PASS** |
| **`PARENT`** | Parent / Guardian | Child Passport & Engagement | Parent Portal Hub, Child Attendance, Child Fees, Digital Consent, Direct Messaging | Other students' records, Staff HR, Administration, Grade editing | Scoped strictly to linked `childIds` | `requireParent`, Child ID validation | **PASS** |
| **`STUDENT`** | Enrolled Student | Self Learning, Marketplace & Opps| Student Skills Passport, Opportunities, Portfolio, Marketplace, Live Learning, Homework | Financial backends, Admin records, Classmates' private grades | Scoped strictly to student's own ID | `requireStudent`, Student ID validation | **PASS** |
| **`SPONSOR`** | Sponsor / Corporate Partner | Sponsorship Discovery & Escrow | Sponsorship Bridge, Sponsor Portal, Grant Submissions, Escrow Pledges | Full student identities (masked), School internal finances | Privacy masking on student dossiers | `requireSponsor`, Anonymization filter | **PASS** |

---

### Multi-Tenant Isolation Verification
1. **School ID Partitioning:** Every query across `students`, `attendance`, `fees`, `payments`, `orders`, and `messages` strictly binds `schoolId === activeUser.schoolId`.
2. **Cross-Tenant Prevention:** Attempting to query an entity with a mismatched `schoolId` returns `404 Not Found` or `403 Forbidden`.
3. **Impersonation Protection:** Role-switching requires Super Admin authentication and generates an immutable audit record in `store.audit`.
4. **Client-Side Guarding:** `checkRouteAccess()` automatically renders `<RouteAccessDenied />` if the current user lacks required permissions.
