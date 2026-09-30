# Reusable / Notable Queries

Raw SQL and hand-built TypeORM `createQueryBuilder`/`manager.query()` calls found in the API codebase,
reproduced here as documented T-SQL for reference. Everything else in the codebase goes through plain
TypeORM repository methods (`find`, `findOne`, `save`, `update`, `delete`, `count`) built from
`FindOptionsWhere` objects — those are not raw SQL and are not duplicated here; see each module's
`*.service.ts` for the exact filter logic.

| File | Used by | Notes |
|---|---|---|
| [otp-resend-cooldown-check.sql](otp-resend-cooldown-check.sql) | `OtpService.generateOtp` | 60s resend cooldown |
| [otp-daily-rate-limit-check.sql](otp-daily-rate-limit-check.sql) | `OtpService.generateOtp` | 5/day rate limit |
| [otp-verify.sql](otp-verify.sql) | `OtpService.verifyOtp` | hash + expiry + purpose match |
| [booking-patient-name-lookup-UNSAFE.sql](booking-patient-name-lookup-UNSAFE.sql) | `BookingsService.createBooking` | ⚠ raw string-interpolated query in the live code — SQL injection risk, documented not fixed |
| [admin-revoke-assignment-lookup.sql](admin-revoke-assignment-lookup.sql) | `AdminService.revokeAssignment` | matches by assignment id or booking id |

Ad hoc schema-migration/seed SQL (ALTER TABLE, INSERT seed data) is indexed separately in
[../migrations/history.md](../migrations/history.md) rather than here, since those already exist as
complete `.ts` files in the repository.
