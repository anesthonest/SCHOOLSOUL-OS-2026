# RBAC & Tenant Security Audit Report — SchoolSoul OS 2026.1.0

## 1. 4-Layer Security Architecture

SchoolSoul OS enforces a 4-layer Role-Based Access Control (RBAC) and Record-Level Security model (`/src/security/accessControl.ts`):

```
Layer 1: Authentication (JWT token validity, session active, inactivity lock timer)
   │
Layer 2: Role Architecture (Executive, Academic, Financial, Guardian, Learner, Technical)
   │
Layer 3: Action Permissions (View, Create, Edit, Delete, Approve, Export, Manage)
   │
Layer 4: Record-Level Scope (Tenant schoolId, Linked Ward ID, Assigned Class/Subject)
```

---

## 2. Role Security Matrix Across 10 Levels

| Educational Level | Primary Modules | Allowed Roles | Required Action |
| :--- | :--- | :--- | :--- |
| **Level 1: School Overview** | Central Dashboard, Executive Cockpit, Global Framework, Emergency Alerts | `*` (Adaptive View), System Admin, Headteacher | `View` |
| **Level 2: Admissions & People** | Admissions, Student Passports, Staff HR, Parent Portal, PTM | Headteacher, Director of Studies, Bursar, Class Teacher, Guardian (Portal only) | `Manage` / `View` |
| **Level 3: Academic Structure** | Classes, Subjects, Calendar, Timetable, Lesson Planner | Headteacher, Director of Studies, Class Teacher, Subject Teacher | `Manage` / `Create` |
| **Level 4: Teaching & Learning** | Live Learning, Homework, Exams, Gradebook, Report Cards, Attendance | Headteacher, Director of Studies, Class Teacher, Subject Teacher, Student (View) | `Create` / `Edit` |
| **Level 5: Student Development** | Skills Passport, Opportunity Hub, Missions, Showcase, Sponsorship | Headteacher, Director of Studies, Teacher, Student, Sponsor (Portal) | `View` / `Create` |
| **Level 6: School Operations** | Operations, Visitor Register, Staff Leave, Assets, Health, Safeguarding | Headteacher, System Admin, Matron/Nurse (Health), Safeguarding Officer | `Manage` / `View` |
| **Level 7: Communication** | Messaging, SMS Gateway, WhatsApp, Announcements, Helpdesk, LAN Sync | All authenticated roles with scoped channels | `Create` / `View` |
| **Level 8: Finance & Commerce** | Finance Hub, Fee Structures, Student Accounts, Payment Engine, Canteen | Bursar, Headteacher, System Admin (Settings only) | `Manage` / `Approve` |
| **Level 9: Reporting & Intelligence**| Predictive AI, Risk Analytics, Financial Simulator, Board Packs | Headteacher, Board, Bursar, Director of Studies | `View` / `Export` |
| **Level 10: System Admin** | User Management, Roles, System Integrity (V26), Backups, Health | System Admin, Headteacher | `Manage` |

---

## 3. Tenant Isolation Guarantees

1. **Database Queries**: All database read/write queries explicitly require and filter by `schoolId`.
2. **API Endpoints**: Request headers include `X-School-ID` and JWT bearer token verifying membership in the target institution.
3. **QR Scanner**: Cross-school QR scans are flagged and rejected immediately with audit log generation.
4. **Offline Storage**: IndexedDB database names and tables are scoped to the active tenant.
