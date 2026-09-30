# Database Documentation

Entry point for everything about the `in-house-doctor-backend` database. Start with
[DATABASE_CONTEXT.md](DATABASE_CONTEXT.md) for a concise overview; use this file for the folder map and
verification status.

## Folder map

| Path | Contents |
|---|---|
| [DATABASE_CONTEXT.md](DATABASE_CONTEXT.md) | Concise, AI-session-optimized overview — read this first |
| [schema/tables/](schema/tables/) | One `.sql` file per table with full column/constraint definitions (per code, now matching the live database) |
| [schema/relationships.md](schema/relationships.md) | How tables relate, by business domain |
| [schema/views/](schema/views/), [schema/functions/](schema/functions/) | None found, in code or live (see each README) |
| [schema/indexes/](schema/indexes/) | Indexes per code (PK/unique) plus the hand-added live indexes discovered by introspection |
| [procedures/](procedures/) | None found, in code or live (see README) |
| [queries/](queries/) | Notable raw/hand-built SQL queries pulled from service code, with parameter notes |
| [migrations/history.md](migrations/history.md) | Index of the ad hoc schema-migration/seed scripts already in the repo (not duplicated) |
| [migrations/pending-migrations.md](migrations/pending-migrations.md) | **Applied 2026-09-29 + 2026-09-30** — the catch-up migration and follow-up cleanup that brought the live DB fully in line with the code, kept as a historical record |
| [inventory.md](inventory.md) | Full object inventory: name, type, definition file, referencing module, doc status |

## Source of truth used

**The application code is the source of truth for this documentation**, per project convention: every
table's authoritative definition comes from its **TypeORM entity** (`src/entities/*.entity.ts`), backed
by the repository's ad hoc migration/seed scripts for columns added after initial creation. Two tables
(`faqs`, `testimonials`) have their `CREATE TABLE` text captured verbatim from
`src/create-cms-tables.ts`, since that script IS their original definition.

## Live database — connected, checked, and migrated

A live connection to `DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB` was established via Windows
Trusted Connection (the `.env` SQL-auth credentials for user `sa` did not authenticate; Windows
integrated auth — the same fallback this repo's own `check-db.ts`/`seed-admin.ts` scripts use — worked).

**Timeline:**
- **2026-09-28**: full introspection (`sys.tables`, `sys.columns`, `sys.foreign_keys`, `sys.indexes`,
  `sys.views`, `sys.objects`/functions, `sys.procedures`) found the live database behind the code in
  several places — missing `StaticPages` table, an outdated `DoctorAvailability` shape, only 1 of ~19
  expected FK constraints present, missing unique constraints, and a few narrower-than-expected columns.
- **2026-09-29**: at the user's request, the catch-up migration was run against this local database —
  see [migrations/pending-migrations.md](migrations/pending-migrations.md) for the exact script and
  results. All statements applied cleanly (pre-flight checks found zero conflicting data). Verified
  afterward: `StaticPages` exists, `DoctorAvailability` matches the entity shape (old data preserved in
  `DoctorAvailability_Legacy`), FK count went from 1 → 19, unique constraints from 2 → 6, and the
  truncation-risk columns are now `NVARCHAR(MAX)`.

- **2026-09-30**: the two remaining orphaned objects (`dbo.UserNotifications`, `dbo.DoctorAvailability_Legacy`)
  plus 5 unused/dead columns (`Users.ModifiedDate`/`LastLoginDate`/`ProfileCompleted`,
  `MedicalRecords.FilePath`/`UploadedDate`) were investigated at row level, confirmed empty/unused, and
  dropped. **The live database now matches the code exactly**, except `dbo.SystemSettings` (absent on
  both sides — a non-issue).

See [migrations/pending-migrations.md](migrations/pending-migrations.md) §5 for the investigation
findings and the drop script.

## Multiple environments

No evidence of environment-specific schema differences (dev/staging/prod) was found in the repository —
a single `.env`-driven connection config, confirmed to point at a local SQL Server Express instance
(`DESKTOP-GKN0UQE\SQLEXPRESS`, database `InHouseDoctorDB`). If separate staging/prod databases exist,
they have **not** received this migration — re-run the script in
[migrations/pending-migrations.md](migrations/pending-migrations.md) against each of them separately if
so, after re-checking their data for the same pre-flight conditions (duplicate emails, duplicate
Payments.BookingId rows, FK orphans).
