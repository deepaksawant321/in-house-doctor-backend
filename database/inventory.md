# Database Object Inventory

Source of truth: application code (`src/entities/*.entity.ts`). A live connection to
`DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB` was introspected on 2026-09-28, **migrated to match the
code on 2026-09-29**, and had its last two orphaned/unused objects (empty tables and dead columns)
**cleaned up on 2026-09-30** — see [migrations/pending-migrations.md](migrations/pending-migrations.md)
for both applied scripts. The live database now matches the code exactly, with the sole exception of
`SystemSettings` (doesn't exist live, unused in code either — fully consistent).

| Object | Type | Schema | Definition file | Referencing API module(s) | Depends on | Live DB status (as of 2026-09-29 migration) |
|---|---|---|---|---|---|---|
| Users | Table | dbo | [schema/tables/Users.sql](schema/tables/Users.sql) | auth, users, admin, bookings, patients, dashboard | — | Matches exactly — 3 unused extra columns dropped 2026-09-30 |
| Patients | Table | dbo | [schema/tables/Patients.sql](schema/tables/Patients.sql) | patients, bookings, dashboard, medical-records | Users | Matches — FK_Patients_Users added |
| Doctors | Table | dbo | [schema/tables/Doctors.sql](schema/tables/Doctors.sql) | doctors, doctor-availability, admin, bookings, medical-records | — | Matches (minor column-length differences only, not part of migration) |
| AdminUsers | Table | dbo | [schema/tables/AdminUsers.sql](schema/tables/AdminUsers.sql) | admin | — | Matches — Email unique added, MobileNo widened |
| Bookings | Table | dbo | [schema/tables/Bookings.sql](schema/tables/Bookings.sql) | bookings, admin, dashboard, payments, medical-records, notifications | Users, Patients, Doctors, (loose) Services, (loose) UserAddresses | Matches — FK_Bookings_Users/Doctors added (Patients FK pre-existing) |
| BookingStatusHistory | Table | dbo | [schema/tables/BookingStatusHistory.sql](schema/tables/BookingStatusHistory.sql) | bookings | Bookings | Matches — FK added, Remarks widened |
| Payments | Table | dbo | [schema/tables/Payments.sql](schema/tables/Payments.sql) | payments, admin, dashboard | Bookings | Matches — FK + unique constraint added, Remarks widened |
| Prescriptions | Table | dbo | [schema/tables/Prescriptions.sql](schema/tables/Prescriptions.sql) | bookings | Bookings | Matches — FK_Prescriptions_Bookings added |
| Notifications | Table | dbo | [schema/tables/Notifications.sql](schema/tables/Notifications.sql) | notifications, bookings, payments, admin, dashboard | Bookings, Users | Matches — both FKs added |
| Services | Table | dbo | [schema/tables/Services.sql](schema/tables/Services.sql) | services, cms, bookings (loose) | — | Matches closely (not part of migration) |
| DoctorAssignments | Table | dbo | [schema/tables/DoctorAssignments.sql](schema/tables/DoctorAssignments.sql) | admin | Bookings, Doctors | Matches — both FKs added |
| DoctorAvailability | Table | dbo | [schema/tables/DoctorAvailability.sql](schema/tables/DoctorAvailability.sql) | doctor-availability | Doctors | Matches exactly — rebuilt 2026-09-29; the empty `DoctorAvailability_Legacy` holding table (had 0 rows) was dropped 2026-09-30 |
| DoctorCoverageAreas | Table | dbo | [schema/tables/DoctorCoverageAreas.sql](schema/tables/DoctorCoverageAreas.sql) | doctors | Doctors | Matches — FK added |
| OTPVerifications | Table | dbo | [schema/tables/OTPVerifications.sql](schema/tables/OTPVerifications.sql) | otp, auth | — | Matches closely (not part of migration) |
| OTPLogs | Table | dbo | [schema/tables/OTPLogs.sql](schema/tables/OTPLogs.sql) | otp (repo injected, unused) | — | Matches closely — **appears write-dead in code** |
| RefreshTokens | Table | dbo | [schema/tables/RefreshTokens.sql](schema/tables/RefreshTokens.sql) | auth | Users | Matches — FK added |
| UserSessions | Table | dbo | [schema/tables/UserSessions.sql](schema/tables/UserSessions.sql) | auth | Users | Matches — FK added |
| UserAddresses | Table | dbo | [schema/tables/UserAddresses.sql](schema/tables/UserAddresses.sql) | addresses, users, bookings (loose) | Users | Matches — FK added |
| MedicalRecords | Table | dbo | [schema/tables/MedicalRecords.sql](schema/tables/MedicalRecords.sql) | medical-records | Patients, Doctors, Bookings | Matches exactly — 3 FKs added 2026-09-29, 2 unused legacy columns dropped 2026-09-30 |
| AuditLogs | Table | dbo | [schema/tables/AuditLogs.sql](schema/tables/AuditLogs.sql) | audit-logs, admin | — | Matches closely (not part of migration) |
| faqs | Table | dbo | [schema/tables/faqs.sql](schema/tables/faqs.sql) | cms | — | Matches exactly (DDL captured verbatim) |
| testimonials | Table | dbo | [schema/tables/testimonials.sql](schema/tables/testimonials.sql) | cms | — | Matches exactly (DDL captured verbatim) |
| CmsBlocks | Table | dbo | [schema/tables/CmsBlocks.sql](schema/tables/CmsBlocks.sql) | cms | — | Matches closely (not part of migration) |
| StaticPages | Table | dbo | [schema/tables/StaticPages.sql](schema/tables/StaticPages.sql) | cms | — | **Created 2026-09-29** — previously missing entirely |
| Settings | Table | dbo | [schema/tables/Settings.sql](schema/tables/Settings.sql) | settings, admin (duplicate impl.) | — | Matches closely (not part of migration) |
| SystemSettings | Table | dbo | [schema/tables/SystemSettings.sql](schema/tables/SystemSettings.sql) | **none found** | — | Still doesn't exist live — consistent with being unused/orphaned in code. Sole remaining code/DB gap, and it's a non-issue. |
| Views | — | — | [schema/views/README.md](schema/views/README.md) | — | — | None in code or live |
| Functions | — | — | [schema/functions/README.md](schema/functions/README.md) | — | — | None in code or live |
| Stored Procedures | — | — | [procedures/README.md](procedures/README.md) | — | — | None in code or live |
| Additional indexes | — | — | [schema/indexes/README.md](schema/indexes/README.md) | — | — | A few hand-added live indexes beyond what the code declares — see file |

## Coverage statement

This inventory covers every table the **code** declares (26 entities) plus every table found in a **live**
introspection of `InHouseDoctorDB`. As of 2026-09-30, the live database has exactly 25 tables and they
match the 25 in-use entities column-for-column — the 26th entity, `SystemSettings`, has no live table and
no code usage either, so there is nothing left to reconcile. This does not claim to cover any other
database/environment (e.g. a separate staging or production `InHouseDoctorDB`) — only the one instance
reached this session (`DESKTOP-GKN0UQE\SQLEXPRESS`). If other environments exist and haven't received
these changes, re-run [migrations/pending-migrations.md](migrations/pending-migrations.md) (§1–3, then
§5) against each after re-checking their data for the same pre-flight conditions.
