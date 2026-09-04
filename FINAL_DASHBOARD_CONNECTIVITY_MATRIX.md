# SCHOOLSOUL OS 2026.1.0
## FINAL DASHBOARD CONNECTIVITY MATRIX

**Release Candidate:** SchoolSoul OS 2026.1.0  
**Audit Standard:** All 14 Core & Specialized Dashboards Verified for Data Binding, Metrics Calculation, Filter Responsiveness & Navigation

---

### Master Dashboard Verification Table

| Dashboard ID | Dashboard Name | Screen / Route | Target User Role | Live Data Sources | Rendered Metric Cards | Filter / Time-Range Controls | Drilldown Navigation | Refresh / Sync | Responsive Layout | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DSH-01** | Master School Operations Cockpit | `dashboard` | Headteacher, Super Admin | Students, Attendance, Fees, Staff | Total Students, Daily Attendance %, Fee Collection %, Active Staff | Term selector, Date range | Quick link to each subsystem | Auto-poll & WebSocket | Grid (Desktop/Tablet/Mobile) | **PASS** |
| **DSH-02** | Opportunity & Skills Hub Dashboard | `opportunity-hub` | All Roles | Opportunities, Badges, Portfolios | Active Missions, Verified Passports, Issued Badges, Pledges | Category, Grade, Skill tag | Deep link to student passport | Instant local & server sync | Responsive Tabbed Bento | **PASS** |
| **DSH-03** | Sponsorship & Student Bridge Portal| `sponsorship-bridge` | Sponsor, Admin | Sponsorships, Pledges, Escrow | Total Sponsored, Active Pledges, Escrow Balance, Impact Score | Funding Tier, Academic Level | Link to privacy-masked student | Real-time ledger polling | Split Cards Layout | **PASS** |
| **DSH-04** | Live Learning & Virtual Classrooms | `live-learning` | Teachers, Students | Live Rooms, Participants, Streams | Active Classes, Attending Students, Bandwidth, Recordings | Subject, Grade, Teacher | Join live WebRTC room | WebSocket room state | Media-first Responsive Grid | **PASS** |
| **DSH-05** | School Market & Commercial Hub | `v9-student-marketplace` | All Roles, Bursar | Products, Orders, Escrow, Payouts | Total GMV, Platform Fees, Orders Pending, Inventory Alerts | Category, Price, Vendor | Product modal & checkout | Event-driven order updates | E-Commerce Responsive Grid | **PASS** |
| **DSH-06** | Financial Executive Dashboard | `financial-dashboards` | Bursar, Headteacher, Board | Fees, Expenses, Budgets, Bank | Total Invoiced, Collected UGX, Outstanding Arrears, Net Margin | Term, Academic Year, Class | Drilldown to student fee account| Real-time payment sync | Analytical Chart Grid | **PASS** |
| **DSH-07** | Academics & Examinations Analytics | `academic-analytics` | DOS, Teachers | Marks, Exams, Class GPAs | Average Score %, Top Subjects, At-Risk Students, Exam Readiness | Exam Series, Subject, Stream | Drilldown to teacher gradebook | Term grade calculations | Recharts Chart Dashboard | **PASS** |
| **DSH-08** | Operations & Attendance Analytics | `attendance-analytics` | DOS, Admin | Daily Registers, Leave Logs | Attendance %, Unexcused Absences, Chronic Truancy, Staff On-Duty | Daily, Weekly, Monthly, Class | Drilldown to class roll-call | Instant check-in refresh | Heatmap & Summary Cards | **PASS** |
| **DSH-09** | Safeguarding & Student Welfare Hub | `safeguarding-centre` | Safeguarding Lead, Admin | Welfare cases, Clinic logs, Commendations | Open Cases, Medical Visits, Behavior Score, Interventions | Incident severity, Date, Status| Confidential case detail view | Secure state encryption | High-privacy Card Matrix | **PASS** |
| **DSH-10** | Staff HR & Performance Cockpit | `administration-dashboards`| Admin, DOS | Staff directory, Leave, Appraisals | Active Teachers, On-Leave Count, CPD Hours Logged, Appraisal Score | Department, Role, Employment Type| Drilldown to staff dossier | HR state synchronization | Professional Directory Grid | **PASS** |
| **DSH-11** | Parent Communication & Engagement | `communication-dashboards`| Admin, PR | Messages, SMS, WhatsApp, Announcements | SMS Deliverability %, WhatsApp Broadcasts, Unread Inquiries, Event RSVPs | Channel, Date range, Campaign | Drilldown to chat thread | Gateway status webhook | Live Feed & Metric Dashboard| **PASS** |
| **DSH-12** | School Intelligence & AI Cockpit | `v8-intelligence-hub` | Board, Executive | AI Predictions, At-risk patterns, Budget | Retention Risk %, Revenue Projection, Learning Velocity Index | Horizon (1M, 6M, 1Y), Scope | AI simulator parameter tuning | Background predictive model | Executive AI Bento Grid | **PASS** |
| **DSH-13** | Multi-Country Global Framework | `global-framework` | Admin, Ministry Liaison | Country Curricula, EMIS, Grading | Active Frameworks, EMIS Records, Mapped Subjects, Equivalency Ratio| Country (UG, KE, TZ, RW, SS, NG)| Framework selector switch | Instant curriculum switch | Global Policy Split Matrix | **PASS** |
| **DSH-14** | System Administration & Diagnostics | `health` | Super Admin | Database, Auth, Network, Memory | CPU Load, Memory %, DB Latency (ms), Pesapal Gateway Status | Subsystem selector, Log level | Direct action to Backup/Audit | 5-second polling interval | Diagnostic Status Gauges | **PASS** |

---

### Dashboard Verification Summary
- **Total Operational Dashboards:** 14/14 Audited & Verified
- **Data Binding Integrity:** 100% connected to live state and backend stores
- **Interactive Filtering & Metric Breakdown:** Functional across all viewports
- **Status:** **ALL 14 DASHBOARDS PASS**
