# Security Specification: Ghana Health Service, Essikado Hospital Temporal Payroll

## 1. Data Invariants
1. **User Identity & Role Invariance**: System user records in `/users/{userId}` require authentication. Only Super Admin can mutate role permissions or provision administrative users.
2. **Staff Record Protection**: Staff in `/staff/{staffId}` must maintain valid Ghana Card numbers, valid hospital staff IDs, and non-negative standard base pay.
3. **Audit Trail Immutability**: Logs in `/auditLogs/{logId}` can only be appended; existing logs can NEVER be updated or deleted.
4. **Payslip Authenticity & Integrity**: Payslips in `/payslips/{payslipId}` must possess a non-empty SHA-256 security hash and unique serial number. Locked payslips cannot be overwritten.
5. **Cadre & Pay Benchmarks**: Job Categories in `/jobCategories/{categoryId}` require non-negative standard monthly rates and standard daily rates.

## 2. The Dirty Dozen Payloads (Adversarial Vectors)
1. **Ghost Field Escalation**: Payload injects `role: 'super_admin'` or `isAdmin: true` into a standard staff user document.
2. **Audit Tampering**: Update request attempting to overwrite or truncate an existing `/auditLogs/{logId}` entry.
3. **Negative Base Pay Injection**: Creating a staff record with `standardMonthlyRate: -5000`.
4. **Oversized String Bomb**: Injecting a 2MB payload into `fullName` or `description` to exhaust Firestore quotas.
5. **ID Poisoning Attack**: Passing a document ID containing special path traversal characters `../../`.
6. **Self-Approval Bypass**: Non-admin user updating `status: 'Final Approved'` in `/payrollCycles/{cycleId}`.
7. **Hash Stripping**: Writing a payslip document without the mandatory `securityHash`.
8. **Unauthenticated Read of Private Staff PII**: Querying staff Ghana Card and bank account numbers without valid auth.
9. **Orphaned Payslip Write**: Creating a payslip referencing a non-existent `payrollCycleId`.
10. **Serial Number Re-use**: Attempting to alter the serial number of an existing payslip document.
11. **Cadre Rate Zeroing**: Deleting standard categories to paralyze automated payroll calculators.
12. **Cross-Tenant Document Deletion**: Unauthorized delete request on another hospital unit's ledger records.
