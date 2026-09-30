# DATABASE_CONTEXT.md

Concise database reference for `in-house-doctor-backend`. Read [../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md)
first for overall app architecture; read this file before any database-related task. Full definitions
live in `schema/tables/*.sql` — this file intentionally does not repeat them.

**Last checked**: 2026-09-30. **Source of truth for schema documentation: the application code**
(`src/entities/*.entity.ts` + ad hoc migration/seed scripts, see [migrations/history.md](migrations/history.md)).
A live connection to `DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB` (Windows Trusted Connection) was
established, introspected on 2026-09-28 (found the live schema behind the code), migrated to match on
2026-09-29, and had its last two orphaned/unused objects cleaned up on 2026-09-30 after confirming they
held no data. **The live database now matches the code exactly**, with the sole exception of
`SystemSettings` (absent live, unused in code — a non-issue). See
[migrations/pending-migrations.md](migrations/pending-migrations.md) for the full history.

## Technology

- **Engine**: Microsoft SQL Server (MSSQL Express), accessed via `mssql`/`msnodesqlv8` (ODBC Driver 17) through TypeORM 1.x.
- **Host**: `DESKTOP-GKN0UQE\SQLEXPRESS` (local named instance). **Database**: `InHouseDoctorDB`.
- **Schema management**: `synchronize: false` — no TypeORM migrations folder; schema evolves via ad hoc idempotent scripts (see [migrations/history.md](migrations/history.md)) plus the newly-identified catch-up scripts in [migrations/pending-migrations.md](migrations/pending-migrations.md).

## Schema overview

26 tables per the code; 25 of them exist live and match column-for-column (as of the 2026-09-29 migration
and 2026-09-30 cleanup). The 26th, `SystemSettings`, doesn't exist live — consistent with being unused in
code too. Single `dbo` schema (two tables — `faqs`, `testimonials` — deliberately use lowercase names and
lowerCamelCase columns, a later/different convention than the rest). No views, functions, or stored
procedures exist in the codebase, and none were found live either. Full per-table DDL:
[schema/tables/](schema/tables/). Full inventory with doc status: [inventory.md](inventory.md).

**Domains**:
- **Identity/auth**: Users, AdminUsers, RefreshTokens, UserSessions, OTPVerifications, OTPLogs
- **Booking core**: Bookings, BookingStatusHistory, Patients, Doctors, DoctorAssignments, DoctorAvailability, DoctorCoverageAreas, Prescriptions, MedicalRecords, UserAddresses
- **Payments**: Payments
- **Comms**: Notifications
- **CMS/content**: Services, faqs, testimonials, CmsBlocks, StaticPages
- **Config**: Settings (used), SystemSettings (orphaned in code — no referencing module, and no live table either)
- **Audit**: AuditLogs

Relationship map by domain: [schema/relationships.md](schema/relationships.md).

## Stored procedures / views / functions

None exist, in code or live. See [procedures/README.md](procedures/README.md), [schema/views/README.md](schema/views/README.md),
[schema/functions/README.md](schema/functions/README.md).

## Notable queries

Hand-built raw SQL / QueryBuilder logic (OTP rate-limiting, the insecure raw booking lookup, admin
assignment revocation) is indexed in [queries/README.md](queries/README.md). Everything else is plain
TypeORM repository calls (`find`/`findOne`/`save`/`update`) — not raw SQL, not duplicated here.

## API → database data flow

`Controller → Service (@InjectRepository) → TypeORM Repository → MSSQL`. No separate repository/DAO
layer beyond TypeORM's own `Repository<T>`. Response convention is inconsistent: `AuthService`/most CRUD
services return `{ success, message?, data }`; `BookingsService` and `PaymentsService` return raw
entities.

Core workflow: **Booking → Payment → Admin verification → Doctor assignment → Status progression → Visit
→ Prescription/records**. Every booking/payment/assignment mutation in `BookingsService`/`PaymentsService`/
`AdminService` triggers, best-effort: a DB write, a `Notifications` row, and a non-blocking email
(failures are caught/logged, never fail the request).

## Naming conventions

- PascalCase table names and `ColumnNameLikeThis` columns almost everywhere (`Bookings.BookingId`, `Users.MobileNo`).
- Exceptions: `faqs`/`testimonials` use lowercase table names + lowerCamelCase columns (`id`, `isActive`, `createdDate`).
- Primary keys: `IDENTITY(1,1) BIGINT` or `INT` almost everywhere per the code; **`DoctorAvailability`**
  and **`SystemSettings`** are the only two entities using a `UNIQUEIDENTIFIER` (uuid) PK instead.
- All entities extend a shared `BaseEntity` (`src/common/entities/base.entity.ts`) — but that base class
  is **empty** (contributes zero columns); every audit/timestamp column (`CreatedDate`, etc.) is declared
  directly on each entity instead. A second, unrelated `BaseEntity` at
  `src/common/database/base.entity.ts` (uuid PK + `createdAt`/`updatedAt`/`deletedAt`/`createdBy`/`modifiedBy`)
  is **dead code** — confirmed not imported by any entity.

## Transaction & error handling conventions

- No explicit SQL transactions (`QueryRunner`/`DataSource.transaction`) found anywhere — multi-step
  writes (e.g. booking creation → status history → notification → email) run as sequential `await`s, not
  atomically.
- Email sends are deliberately wrapped in `try/catch` and logged on failure, never rethrown.
- `PatientsService.remove()` specifically catches SQL error 547 (FK violation) to translate it into a
  409 `ConflictException`.

## Known issues

**Code-level** (see [../PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) for full list):
1. SQL injection risk in `BookingsService.createBooking` ([bookings.service.ts:88](../src/modules/bookings/bookings.service.ts)).
2. Admin password hash logged via `console.log` in `AdminService.login`.
3. `SystemSettings` entity orphaned — no referencing module.
4. `OTPLogs` appears write-dead — no code path inserts into it.
5. Duplicate settings logic between `SettingsService` and `AdminService`.
6. Booking status values used in code (`'Pending'`, `'Confirmed'`) that aren't in the `BookingStatus` enum.

**Live database — migrated 2026-09-29, cleaned up 2026-09-30** (all fixed; see
[migrations/pending-migrations.md](migrations/pending-migrations.md) for the full applied history):
7. ~~`StaticPages` table doesn't exist live~~ — **fixed**: created 2026-09-29.
8. ~~`DoctorAvailability` live table used an old, incompatible shape~~ — **fixed**: rebuilt 2026-09-29 to match the entity.
9. ~~Most FK relations had no matching constraint live~~ — **fixed**: 18 FK constraints added 2026-09-29 (19 total, up from 1).
10. ~~`Payments.BookingId` had no live UNIQUE constraint~~ — **fixed**: `UQ_Payments_BookingId` added.
11. ~~Several columns were narrower live than the code expects~~ — **fixed** for `Payments.Remarks`, `BookingStatusHistory.Remarks` (now `NVARCHAR(MAX)`), `Bookings.BookingNo`, `Users`/`AdminUsers` MobileNo/Email.
12. ~~`dbo.UserNotifications` existed live but wasn't modeled by any entity~~ — **fixed**: investigated 2026-09-30, found empty (0 rows), dropped.
13. ~~`Users`/`MedicalRecords` had unmapped extra/legacy columns~~ — **fixed**: investigated 2026-09-30, found unused (0 populated rows, or only DB-default-populated), dropped.

**No open database/code gaps remain**, other than `SystemSettings` being absent on both sides (a
non-issue).

## Key file references

- Connection config: [../src/common/database/database.config.ts](../src/common/database/database.config.ts)
- All entities: [../src/entities/](../src/entities/)
- Migration/seed script index: [migrations/history.md](migrations/history.md)
- **Pending catch-up migrations (live DB vs. code)**: [migrations/pending-migrations.md](migrations/pending-migrations.md)
- Full inventory: [inventory.md](inventory.md)
- Relationships: [schema/relationships.md](schema/relationships.md)
