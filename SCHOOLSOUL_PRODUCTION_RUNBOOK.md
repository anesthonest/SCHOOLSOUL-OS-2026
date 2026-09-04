# SchoolSoul Production Runbook & Operations Manual

## 1. Routine Deployment & Updates

### Zero-Downtime Rollout Steps
1. Push code changes to the `main` branch.
2. Render triggers automated build via `npm run build` (`vite build` + `esbuild` server bundle).
3. The `/ready` probe ensures the new server instance has verified database connections before routing user traffic.
4. Old container is cleanly drained and terminated with `SIGTERM`.

### Rollback Procedure
If a regression or deployment issue occurs:
1. In the Render Dashboard, go to **Deploys**.
2. Locate the last known healthy deployment commit.
3. Click **Rollback to this deploy**.
4. Monitor `/health` to confirm system recovery.

---

## 2. Database Maintenance & Backups

### Render PostgreSQL Automated Backups
- Render provides automated daily snapshots with point-in-time recovery.
- To trigger a manual database dump before major data operations:
  ```bash
  pg_dump "$DATABASE_URL" -F c -b -v -f schoolsoul_backup_$(date +%Y%m%d_%H%M%S).dump
  ```

### Database Restore Procedure
```bash
pg_restore -d "$DATABASE_URL" -v -c schoolsoul_backup_YYYYMMDD_HHMMSS.dump
```

---

## 3. Pesapal Payment Operations & Incident Handling

### Issue 1: "IPN Notification Failed / Delayed"
- **Symptom**: Customer paid via MTN MoMo / Airtel Money, but the invoice status remains `PENDING`.
- **Resolution**:
  1. The built-in **SchoolSoul Background Reconciliation Worker** automatically polls pending payments older than 90 seconds.
  2. To manually trigger immediate verification, navigate to **School Commercial Value Center** > **Pesapal 3.0 Gateway Cockpit** > click **Run Transaction Status Check** or query:
     ```bash
     GET /api/billing/pesapal/verify?orderTrackingId=<ORDER_TRACKING_ID>
     ```
  3. The system executes server-to-server verification with Pesapal API 3.0 and auto-marks the invoice as `PAID`.

### Issue 2: "OAuth Token Expired / Invalid Credentials"
- **Symptom**: `401 Unauthorized` during order submission.
- **Resolution**:
  1. Verify `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` in Render environment variables.
  2. Tokens are automatically refreshed with a 30-second pre-expiry buffer. Calling `/api/billing/pesapal/health` tests live token acquisition.

---

## 4. Multi-Tenant Isolation & Security Auditing

- Tenant isolation is enforced at the database and middleware layers (`requireSchoolTenant`).
- All administrative events, user logins, role changes, and fee settlements are logged to the immutable `schoolsoul_audit_events` table.
- To inspect audit trail:
  ```bash
  GET /api/audit
  ```

---

## 5. Emergency Incident Response Matrix

| Incident | Severity | Action |
| :--- | :--- | :--- |
| **PostgreSQL Unreachable** | P1 (Critical) | Render restarts database instance; app routes to read-only fast cache while retrying pool connections. |
| **Pesapal API 3.0 Outage** | P2 (High) | App allows invoice viewing; online checkout displays friendly temporary offline notice; background worker retries pending settlements upon service restoration. |
| **Spike in 429 Rate Limit** | P3 (Medium) | Rate limiter protects auth and billing routes; verify client IP behavior in Render access logs. |
