# Table Relationships

Source: TypeORM `@ManyToOne`/`@OneToOne` relations in `src/entities/*.entity.ts`. As of the 2026-09-29
migration (see [../migrations/pending-migrations.md](../migrations/pending-migrations.md)), every one of
these relations is now backed by a real `FOREIGN KEY` constraint in the live database
(`DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB`) — 19 FKs were added, joining the one
(`Bookings.PatientId → Patients.PatientId`) that already existed.

## Core booking workflow

```
Users (1) ──< (N) Patients            "who books" -> "who the visit is for" (a User can have many Patients)
Users (1) ──< (N) Bookings            (owner/creator of the booking)
Patients (1) ──< (N) Bookings         (patient the visit is for)
Doctors (1) ──< (N) Bookings          (assigned doctor, nullable until DoctorAssignments assigns one)
Bookings (1) ──1 Payments             (OneToOne — one payment row per booking, now DB-enforced via UQ_Payments_BookingId)
Bookings (1) ──< (N) Prescriptions
Bookings (1) ──< (N) BookingStatusHistory
Bookings (1) ──< (N) Notifications    (nullable FK — Notifications can also be user-only, unrelated to a booking)
Bookings (1) ──< (N) DoctorAssignments
Bookings (1) ──< (N) MedicalRecords   (nullable — a record can be linked to a booking or standalone)
```

`Bookings.ServiceId` (int) and `Bookings.AddressId` (bigint) remain **loose references** to
`Services.ServiceId` and `UserAddresses.AddressId` — plain columns, not TypeORM relations, and
intentionally left without a live FK (Services/UserAddresses weren't part of the migration; add if you
want this enforced too).

## Doctor domain

```
Doctors (1) ──< (N) DoctorAvailability     (weekly recurring day-of-week + start/end time — table was
                                             rebuilt to this shape 2026-09-29; the old date+slot holding
                                             table was empty and was dropped 2026-09-30)
Doctors (1) ──< (N) DoctorCoverageAreas    (AreaName is overloaded to store a pincode value in practice)
Doctors (1) ──< (N) DoctorAssignments
Doctors (1) ──< (N) MedicalRecords         (nullable — treating doctor, if any)
```

## Patient / user account domain

```
Users (1) ──< (N) UserAddresses
Users (1) ──< (N) RefreshTokens
Users (1) ──< (N) UserSessions
Patients (1) ──< (N) MedicalRecords
```

## Auth / OTP domain

`OTPVerifications` and `OTPLogs` are standalone — they key on free-text `email`/`phoneNumber`/`MobileNo`
columns rather than FK relations to `Users`.

## Admin / audit domain

`AuditLogs` is standalone (`UserId`/`EntityId` are plain bigint columns, not relations) — it stores a
generic before/after JSON snapshot keyed by `EntityName` + `EntityId`, written only via
`AdminService.audit()`.

## CMS / content domain (no relations to the booking domain)

`faqs`, `testimonials`, `Services`, `CmsBlocks`, `StaticPages`, `Settings`, `SystemSettings` are all
standalone content/config tables with no FK relations to each other or to the booking/user domain.

## Orphaned / not modeled in code

- `SystemSettings` (code): no referencing module anywhere; also doesn't exist live. The sole remaining
  code/DB gap — a non-issue since neither side uses it.
- `OTPLogs` (code): injected in `OtpService` but never written to by any current code path (table still
  exists live, untouched — this is a code-side dead-write issue, not a schema gap).

`dbo.UserNotifications` and `dbo.DoctorAvailability_Legacy` (both live-only, not modeled by any entity)
were investigated on 2026-09-30, found empty (0 rows each), and dropped — see
[../migrations/pending-migrations.md](../migrations/pending-migrations.md) §5.
