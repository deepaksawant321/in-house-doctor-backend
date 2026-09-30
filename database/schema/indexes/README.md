# Indexes

## Per code (implied by entity metadata) — now all present live

No explicit secondary/non-key indexes are declared in the TypeORM entities (no `@Index()` decorators
found in `src/entities/*.entity.ts`). The indexes the entities imply are the ones SQL Server creates
automatically for primary keys and unique constraints — as of the 2026-09-29 migration, all of these now
exist live:

| Table | Index (implied) | Backing constraint | Live status |
|---|---|---|---|
| Every table | Clustered PK index on its identity/uuid column | `PK_<Table>` | ✅ always existed |
| Users | Unique index on `MobileNo` | `UQ_Users_MobileNo` | ✅ always existed |
| Users | Unique index on `Email` | `UQ_Users_Email` | ✅ added 2026-09-29 |
| AdminUsers | Unique index on `Email` | `UQ_AdminUsers_Email` | ✅ added 2026-09-29 |
| Payments | Unique index on `BookingId` | `UQ_Payments_BookingId` | ✅ added 2026-09-29 |
| StaticPages | Unique index on `Slug` | `UQ_StaticPages_Slug` | ✅ table + constraint created 2026-09-29 |
| SystemSettings | Unique index on `SettingKey` | `UQ_SystemSettings_SettingKey` | n/a — table doesn't exist live (unused in code, not part of the migration) |

## Hand-added live indexes (pre-existing, not declared by any entity)

These predate this session's migration and were left as-is:

| Table | Index | Type | Notes |
|---|---|---|---|
| Bookings | `IX_Bookings_PatientId` | NONCLUSTERED, non-unique | not in any entity |
| Bookings | `UQ__Bookings__...` (auto-named) | NONCLUSTERED, **unique** on `BookingNo` | pre-existing DB guarantee; consider adding `@Index({unique:true})` to the entity to document it there too |
| Patients | `IX_Patients_UserId` | NONCLUSTERED, non-unique | not in any entity |
| MedicalRecords | `IX_MedicalRecords_PatientId` | NONCLUSTERED, non-unique | not in any entity |

`dbo.UserNotifications` (and its two indexes, `IX_UserNotifications_UserId`/`IX_UserNotifications_IsRead`)
was investigated on 2026-09-30, found empty and not modeled by any entity, and dropped along with the
table — see [../../migrations/pending-migrations.md](../../migrations/pending-migrations.md) §5.

No views, functions, or stored procedures (hence no procedure-related indexes) exist either in the code
or live.
