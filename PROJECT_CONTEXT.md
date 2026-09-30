# PROJECT_CONTEXT.md — in-house-doctor-backend (API)

Related project: [InHouseDoctorWebsite](../InHouseDoctorWebsite/PROJECT_CONTEXT.md) (Next.js frontend)
Database detail: [database/DATABASE_CONTEXT.md](database/DATABASE_CONTEXT.md) — read that before any database-related task.

## A. Project Overview

REST API for "Doctor Doorstep" — a home-doctor-visit booking platform. Serves the public site, patient dashboard, and admin panel in the sibling web repo.

- **Stack**: NestJS 11, TypeORM 1.x, MSSQL (`mssql` driver, `msnodesqlv8` present), Passport-JWT, class-validator, Winston (via `nest-winston`), Swagger, Nodemailer via `@nestjs-modules/mailer`, Helmet, `express-rate-limit`.
- **Architecture**: Modular NestJS app — one module per domain under `src/modules/*`, shared cross-cutting concerns under `src/common/*`, TypeORM entities centralized under `src/entities/*` (not colocated with modules).
- Default port **3001** (`PORT` env, falls back to 3001 if unset).

## B. Project Structure

| Path | Purpose |
|---|---|
| `src/main.ts` | Bootstrap: Winston logger, `trust proxy`, Helmet, CORS (origin allowlist from `CORS_ORIGINS` env, always allows `http://localhost:3000` outside production), global rate limit (10000 req / 15 min / IP), global `ValidationPipe` (whitelist+transform), `GlobalExceptionFilter`, Swagger setup |
| `src/app.module.ts` | Root module — registers `ServeStaticModule` (serves `./uploads` at `/uploads`), `ConfigModule` (global), `MailerModule` (SMTP via env), `DatabaseModule`, and all feature modules |
| `src/common/database/` | `database.config.ts` (MSSQL `TypeOrmModuleOptions` factory — `synchronize: false`, encrypt off, trust server cert), `database.module.ts`, `base.entity.ts` (see below) |
| `src/common/guards/` | `JwtAuthGuard` (extends Passport `AuthGuard('jwt')`, honors `@Public()`), `RolesGuard` (checks `@Roles()` metadata against `user.role`) |
| `src/common/decorators/` | `@Public()`, `@Roles()` |
| `src/common/email/` | `EmailService` — booking confirmation, admin new-booking alert, status update, payment-proof alert, payment-verified emails |
| `src/common/filters/` | `GlobalExceptionFilter`, `all-exceptions.filter.ts` |
| `src/common/logger/` | Winston config/logger |
| `src/entities/*.entity.ts` | All TypeORM entities (User, Patient, Doctor, Booking, Payment, Prescription, MedicalRecord, Notification, AdminUser, AuditLog, CmsBlock, StaticPage, Testimonial, Faq, Setting/SystemSetting, OTPVerification, OTPLog, RefreshToken, UserSession, UserAddress, DoctorAssignment, DoctorAvailability, DoctorCoverageArea, BookingStatusHistory) |
| `src/modules/*` | `auth`, `otp`, `users`, `patients`, `doctors`, `doctor-availability`, `bookings`, `payments`, `addresses`, `notifications`, `admin`, `services`, `dashboard`, `cms`, `settings`, `audit-logs`, `medical-records` — each with `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/` |
| Root-level `*.ts`/`.js` scripts | One-off/dev scripts: `seed-admin.ts`, `seed-services.ts`, `seed-cms.ts`, `migrate-db.ts`, `migrate-settings.ts`, `migrate-services.ts`, `check-*.ts`, `test-*.ts`, `fix-*.ts`, `generate-entities.js`, `query.js` — not part of the running app, used for one-time DB setup/inspection |
| `database-scripts/` | SQL scripts (schema/seed), separate from TypeORM |
| `uploads/` | Static file storage (prescriptions, payment screenshots), served at `/uploads` |

## C. Web Application

N/A (see [InHouseDoctorWebsite/PROJECT_CONTEXT.md](../InHouseDoctorWebsite/PROJECT_CONTEXT.md)).

## D. API Application

- **Auth**: JWT (`@nestjs/jwt` + `passport-jwt`). `JwtStrategy` extracts bearer token, validates against `JWT_SECRET` (has an insecure literal fallback `'fallback_secret_key'` if unset — see Known Issues). Two login paths:
  - **Patients**: OTP-only. `sendOtpLogin` auto-creates a "Guest User" if the identifier (email/phone) doesn't exist, sends OTP; `loginWithOtp` verifies OTP, marks user verified, issues access token + 7-day refresh token, persists both a `UserSession` row and a `RefreshToken` row. `login()` (email+password) is dead/disabled — patients have no `passwordHash` in the current schema, so it always throws `UnauthorizedException('Please login with OTP')`.
  - **Admins**: `AdminService.login` — email + bcrypt password against `AdminUser.passwordHash`, issues JWT with `role: admin.roleName`, writes an audit log entry.
  - Role on JWT payload for patient tokens is hardcoded `'Patient'`; guards (`JwtAuthGuard`, `RolesGuard`) check `@Public()`/`@Roles()` metadata.
- **OTP** (`OtpService`): 6-digit numeric, SHA-256 hashed at rest, 5-minute expiry, 60-second resend cooldown, 5/day rate limit per (target, purpose). Delivery via `EmailOtpProvider` or `SmsOtpProvider` (also has `Msg91OtpProvider`/`TwilioOtpProvider` implementations of `IOtpProvider`/`ISmsProvider`).
- **Bookings** (`BookingsService`): creates a `Booking` (status starts `'Pending'` in service code vs. entity default `BookingStatus.Created` — see Known Issues), logs to `BookingStatusHistory`, creates an in-app `Notification`, and fires confirmation/admin-alert emails non-blocking (try/catch, logged on failure). `updateStatus` similarly logs history + notification + email. Status enum (`BookingStatus`): `Created → PaymentPending → PaymentVerified → DoctorAssigned → DoctorConfirmed → VisitStarted → VisitCompleted`, or `Cancelled`.
- **Payments** (`PaymentsService`): `initiatePayment` generates a mock `transactionId` and **auto-marks payment `Success` after a 2-second `setTimeout`** — an explicit mock/dev payment gateway simulation (logged as `[DEV MockGateway]`). `uploadPaymentProof` stores a screenshot path and sets status `'Pending Verification'` for manual admin review via `verifyPayment`.
- **Validation**: global `ValidationPipe({ whitelist: true, transform: true })` + `class-validator` DTOs per module.
- **Response convention**: most services return `{ success, message, data }` (seen in `AuthService`), but `BookingsService`/`PaymentsService` return raw entities directly — convention is not fully consistent across modules.
- **Swagger**: enabled via `setupSwagger(app)` in `main.ts`.

## E. Database

**Full detail, per-table DDL, relationships, inventory, and known issues now live in
[database/DATABASE_CONTEXT.md](database/DATABASE_CONTEXT.md) and `database/schema/tables/*.sql` — this
section is a short pointer only.**

- **Technology**: MSSQL (SQL Server), TypeORM (`synchronize: false` — schema changes must go through explicit migration/seed scripts, not entity auto-sync). 26 tables, no views/functions/stored procedures anywhere in the codebase.
- **Naming**: PascalCase table/column names almost everywhere (e.g. `Bookings.BookingId`), mapped to camelCase TS properties via `@Column({ name: '...' })`. Two tables (`faqs`, `testimonials`) use a distinct lowercase/lowerCamelCase convention instead.
- **Base entity**: `common/entities/base.entity.ts` (used by nearly every entity) is **empty** — it contributes zero columns; each entity declares its own audit columns (`CreatedDate`, etc.) directly. `common/database/base.entity.ts` (uuid PK + `createdAt`/`updatedAt`/`deletedAt`/`createdBy`/`modifiedBy`) is a **separate, unused/dead** base class — confirmed not imported by any entity.
- **Key relations**: `Booking` → `User` (owner/creator), `Patient` (who the visit is for), `Doctor` (assigned), plus loose `serviceId`/`addressId` FKs (not TypeORM relations — joined manually where needed, e.g. raw SQL in `BookingsService.createBooking`). `Payment` → `Booking` (OneToOne). `Notification`/`BookingStatusHistory`/`DoctorAssignment`/`Prescription`/`MedicalRecord` → `Booking`. `DoctorAssignment`, `DoctorAvailability`, `DoctorCoverageArea` → `Doctor`. Full map: [database/schema/relationships.md](database/schema/relationships.md).
- **Migrations/seeding**: ad hoc TS scripts at repo root and under `src/` (`migrate-db.ts`, `migrate-settings.ts`, `src/migrate-services.ts`, `seed-admin.ts`, `seed-services.ts`, `src/seed-cms.ts`, `src/create-cms-tables.ts`) — no formal TypeORM migrations folder in use. Indexed in [database/migrations/history.md](database/migrations/history.md).
- **Live DB verification**: connected to `DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB` (Windows Trusted Connection), found the live schema behind the code, and brought it fully into line: **2026-09-29** — `StaticPages` created, `DoctorAvailability` rebuilt to the current entity shape, 18 new FK constraints + 3 new unique constraints added, several columns widened (notably `Payments.Remarks`/`BookingStatusHistory.Remarks` to `NVARCHAR(MAX)`); **2026-09-30** — investigated and dropped the 2 remaining orphaned tables and 5 unused columns after confirming (via row-level data checks) none held any data. **The live database now matches the code exactly**, except `dbo.SystemSettings` (absent on both sides — a non-issue). See [database/migrations/pending-migrations.md](database/migrations/pending-migrations.md) for the full history.

## F. Business Logic

- Booking → Payment → Admin-verification is the core workflow: patient books (status `Pending`/`Created`) → initiates payment (mock gateway auto-succeeds in ~2s, or patient uploads a manual payment screenshot) → admin verifies payment (`PaymentsService.verifyPayment`) → admin assigns a doctor (`DoctorAssignment`) → status progresses through the `BookingStatus` enum → visit happens → prescription/medical records can be uploaded.
- Every booking/payment/status transition triggers three side effects in parallel-ish fashion: DB write, in-app `Notification` row, and an email (email failures are swallowed/logged, never fail the request).
- Admin actions (login, presumably assignment/verification) are recorded to `AuditLog` via an `audit()` helper in `AdminService`.

## G. Development Guidelines

- Put new DTOs under the owning module's `dto/` folder; entities stay centralized in `src/entities/`, not per-module.
- Guard new endpoints explicitly with `@Public()` if they must be unauthenticated — default is JWT-protected globally via `JwtAuthGuard`.
- Keep email sends non-blocking (`try/catch` around `emailService.*`, log on failure) — don't let notification/email failures break the primary request, matching existing `BookingsService`/`PaymentsService` pattern.
- Schema is `synchronize: false` — any entity change needs a corresponding migration/seed script, not reliance on TypeORM auto-sync.

## H. Known Issues and Pending Work

- **SQL injection risk**: [src/modules/bookings/bookings.service.ts:88](../in-house-doctor-backend/src/modules/bookings/bookings.service.ts) builds a raw query with string interpolation: `` `SELECT FullName FROM Patients WHERE PatientId = ${createBookingDto.patientId}` `` instead of a parameterized query.
- **Sensitive data logged**: [src/modules/admin/admin.service.ts](../in-house-doctor-backend/src/modules/admin/admin.service.ts) `login()` `console.log`s the admin's bcrypt password hash and password-match result — should be removed before production.
- **Insecure JWT fallback**: `JwtStrategy` falls back to a hardcoded `'fallback_secret_key'` if `JWT_SECRET` is unset.
- **Mock payment gateway** is live in `PaymentsService.initiatePayment` (auto-succeeds after 2s) — needs replacing with a real gateway integration before production use.
- **`common/database/base.entity.ts` is dead code** — a second `BaseEntity` (uuid PK + audit columns) that no entity actually imports; every entity uses the empty `common/entities/base.entity.ts` instead.
- **`SystemSettings` table/entity is orphaned** — registered with TypeORM but not injected/used by any module; the settings singleton actually in use is `Settings`.
- **`OTPLogs` appears write-dead** — injected in `OtpService` but no code path inserts into it (`SmsOtpProvider` is a stub).
- **Duplicate settings logic** — `SettingsService` and `AdminService` each independently implement get/update against the same `Settings` table.
- **Inconsistent response shape** across services (`{ success, message, data }` in `AuthService` vs. raw entities in `BookingsService`/`PaymentsService`).
- **Status value drift from the `BookingStatus` enum**: `BookingsService.createBooking` hardcodes `status: 'Pending'` and `DashboardService.getSummary` filters on `'Confirmed'` — neither value exists in `BookingStatus` (valid values: Created, PaymentPending, PaymentVerified, DoctorAssigned, DoctorConfirmed, VisitStarted, VisitCompleted, Cancelled).
- **`seed-admin.ts` inserts a nonexistent `updatedDate` field** — not a column on `AdminUsers`.
- No formal TypeORM migrations directory — schema changes rely on ad hoc root-level scripts (now indexed in [database/migrations/history.md](database/migrations/history.md)).
- Numerous debug/check/test scripts at repo root (`check-*.ts`, `test-*.ts`, `fix-*.ts`, `query.js`) — appear to be developer scratch tools, not part of the app or an automated test suite (Jest is configured but scope of actual `*.spec.ts` coverage is limited to `audit-logs`, `doctor-availability`, `settings` modules).
- Full list, plus DB-specific issues (unverified live connectivity, type mismatches from ad hoc `ALTER TABLE` scripts, etc.): [database/DATABASE_CONTEXT.md](database/DATABASE_CONTEXT.md) Known Issues section.

## I. Important File References

- Bootstrap/security config: [src/main.ts](src/main.ts)
- Root module: [src/app.module.ts](src/app.module.ts)
- DB config: [src/common/database/database.config.ts](src/common/database/database.config.ts)
- Auth: [src/modules/auth/auth.service.ts](src/modules/auth/auth.service.ts), [src/modules/auth/strategies/jwt.strategy.ts](src/modules/auth/strategies/jwt.strategy.ts), [src/common/guards/jwt-auth.guard.ts](src/common/guards/jwt-auth.guard.ts), [src/common/guards/roles.guard.ts](src/common/guards/roles.guard.ts)
- OTP: [src/modules/otp/otp.service.ts](src/modules/otp/otp.service.ts)
- Bookings: [src/modules/bookings/bookings.service.ts](src/modules/bookings/bookings.service.ts), [src/entities/booking.entity.ts](src/entities/booking.entity.ts), [src/common/enums/booking-status.enum.ts](src/common/enums/booking-status.enum.ts)
- Payments: [src/modules/payments/payments.service.ts](src/modules/payments/payments.service.ts)
- Admin: [src/modules/admin/admin.service.ts](src/modules/admin/admin.service.ts)
