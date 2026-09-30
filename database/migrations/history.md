# Migration / Seed Script History

There is **no formal TypeORM migrations folder** in this project (`synchronize: false`, but no
`src/migrations/*` either). Schema evolution instead happens through ad hoc, idempotent TypeScript
scripts at the repository root and under `src/`, run manually with `ts-node`/`nest`. This file indexes
them in (best-guess) chronological/dependency order — it does **not** duplicate their SQL, since they
already exist as complete files in the repo (per the task's instruction to keep definitions in one
place).

| Script | What it does | Tables affected |
|---|---|---|
| [`../../seed-admin.ts`](../../seed-admin.ts) | Creates or password-resets the default `SuperAdmin` account (`admin@inhousedoctor.com`) | AdminUsers |
| [`../../seed-services.ts`](../../seed-services.ts) | Seeds initial `Services` catalog rows | Services |
| [`../../src/create-cms-tables.ts`](../../src/create-cms-tables.ts) | Idempotent `CREATE TABLE IF NOT EXISTS`-style DDL for `faqs` and `testimonials` | faqs, testimonials |
| [`../../src/seed-cms.ts`](../../src/seed-cms.ts) | Seeds initial FAQ and testimonial content (only if the table is empty) | faqs, testimonials |
| [`../../src/migrate-services.ts`](../../src/migrate-services.ts) | Adds `Slug`, `LongDescription`, `ImageUrl` columns to `Services`; backfills slugs for 4 known services | Services |
| [`../../migrate-db.ts`](../../migrate-db.ts) | Adds `FileUrl` to `MedicalRecords`; adds `Slug`/`LongDescription`/`ImageUrl` to `Services` (duplicate of migrate-services.ts); adds `Email`, `OTPHash`, `Purpose`, `Channel`, `AttemptCount`, `VerifiedAt`, `IPAddress`, `UserAgent` to `OTPVerifications` | MedicalRecords, Services, OTPVerifications |
| [`../../migrate-settings.ts`](../../migrate-settings.ts) | Adds `companyName`, `supportEmail`, `supportPhone`, `whatsappNumber`, `primaryUpiId`, `qrCodeImage` to `Settings` | Settings |

Root-level `check-*.ts`/`test-*.ts`/`fix-*.ts`/`query.js` scripts are ad hoc developer inspection tools
(print schema/data to the console), not migrations — see
[`../../PROJECT_CONTEXT.md`](../../PROJECT_CONTEXT.md) Known Issues.

## Recommendation for future changes

Follow the existing convention (idempotent `IF NOT EXISTS` / `COL_LENGTH(...) IS NULL` guarded
`ALTER TABLE` scripts) until/unless a real TypeORM migrations workflow is introduced. Update the
matching file under `database/schema/tables/` and this history table whenever a script like this is
added or run against the live database.

**See also**: [pending-migrations.md](pending-migrations.md) — a live introspection on 2026-09-28 found
the actual `InHouseDoctorDB` database is behind everything listed above (e.g. `StaticPages` was never
actually created there, `DoctorAvailability` was never migrated to its current entity shape). That file
has the concrete scripts to close the gap.
