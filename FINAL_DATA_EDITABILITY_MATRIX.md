# SchoolSoul OS 2026.1.0 – Final Data Editability Matrix

**Date:** 2026-08-26  
**Audited By:** Senior Software & UX Engineering  
**Scope:** Complete verification of Create, Read, Update, Delete (CRUD) workflows across all administrative and academic operational domains.

---

## 1. Domain Editability & Persistence Verification Matrix

| Domain / Entity | Editable Fields | Authorized Roles | Storage Layer / Service | Audit / History Logging | Status |
|---|---|---|---|---|---|
| **Timetable Slots** | Day, Period, Subject, Teacher, Room, Stream, Notes | Administrator, Director of Studies (DOS), Timetable Master | `academicsApi.ts` / `db.timetableSlots` | `timetableChangeLogs` recorded on every update | **FULLY OPERATIONAL** |
| **Academic Calendar** | Title, Category, Start Date, End Date, Description, Target Audience | Administrator, DOS, Headteacher | `academicsApi.ts` / `db.academicEvents` | Audit log with operator ID & timestamp | **FULLY OPERATIONAL** |
| **Classes & Streams** | Class Name, Grade Level, Stream Label, Capacity, Room, Class Teacher | Administrator, DOS, Head of School | `academicsApi.ts` / `db.classes` | Stream transfer & capacity change logs | **FULLY OPERATIONAL** |
| **Subjects & Departments** | Subject Name, Code, Category, Department, Passing Mark, Optionality | Administrator, DOS, HOD | `academicsApi.ts` / `db.subjects` | Curriculum structure audit log | **FULLY OPERATIONAL** |
| **Assessment & Marks** | Continuous Assessment, Mid-Term, End-Term Marks, Teacher Remarks | Subject Teacher, Class Teacher, DOS, Admin | `assessmentApi.ts` / `db.assessmentMarks` | Mark entry history with timestamp & teacher signature | **FULLY OPERATIONAL** |
| **Homework & Assignments** | Title, Description, Subject, Due Date, Max Points, Attachments | Subject Teacher, HOD, Admin | `academicsApi.ts` / `db.homework` | Submission logs and edit history | **FULLY OPERATIONAL** |
| **Staff & HR Profiles** | Full Name, Phone, Email, Role, Department, Qualification, Salary, Optional TIN/NSSF | Administrator, HR Officer, Bursar | `v7Api.ts` / `schoolsoul_v7_staff_hr` | Profile update history & audit trails | **FULLY OPERATIONAL** |
| **Staff Leave Requests** | Leave Type, Start/End Date, Days Count, Reason, Relief Staff, Status | Staff (Self-Apply), Headteacher (Approve/Reject) | `v7Api.ts` / `schoolsoul_v7_staff_leave` | Status transition logs with approver signature | **FULLY OPERATIONAL** |
| **Visitors & Gate Security** | Visitor Name, Phone, NIN, Org, Person to Visit, Purpose, Check-In/Out | Security Officer, Gate Operator, Admin | `attendanceApi.ts` / `db.visitorLogs` | Check-in / check-out timestamps & badge tracking | **FULLY OPERATIONAL** |
| **Student Registration / Biodata** | First/Middle/Last Name, DOB, Gender, NIN/LIN, Blood Group, Residence, Allergies | Registrar, Admissions, Admin, Class Teacher | `studentApi.ts` / `db.students` | `studentTimeline` event generated on update | **FULLY OPERATIONAL** |
| **Student Status & Transfer** | Status (Active/Suspended/Transferred), Stream/Class Transfer, Reason | Admissions Officer, Headteacher, Admin | `studentApi.ts` / `db.classAssignmentLogs` | Class assignment timeline & transfer records | **FULLY OPERATIONAL** |
| **User & Access Accounts** | Full Name, Username, Email, Phone, Employee Number, Role, Status, Password | Super Admin, Administrator | `api.ts` / `fetchAllUsers`, `updateUser` | System audit trail (`logAuditEvent`) | **FULLY OPERATIONAL** |

---

## 2. Integrity Verification Safeguards

1. **Defensive Defaults:** No editing modal assumes fake pre-filled defaults. Genuinely optional fields render empty strings when unset.
2. **Deterministic Validation:** Required fields (e.g., First Name, Last Name, Class, Day, Period) provide clear inline feedback when left empty.
3. **Immediate State Reconciliation:** After saving updates, UI stores trigger localized state re-fetches without requiring page reloads or causing UI freezes.
