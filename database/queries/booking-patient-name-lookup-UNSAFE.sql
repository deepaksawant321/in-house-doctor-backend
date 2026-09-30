-- Purpose: fetch a patient's display name for the booking-confirmation email.
-- Source: src/modules/bookings/bookings.service.ts:88 — BookingsService.createBooking().
--
-- ⚠ SECURITY ISSUE (documented as-is, not fixed — see database/DATABASE_CONTEXT.md Known Issues):
-- the live application code builds this query via STRING INTERPOLATION of the caller-supplied
-- `patientId`, NOT a parameterized query:
--
--   this.bookingRepo.manager.query(
--     `SELECT FullName FROM Patients WHERE PatientId = ${createBookingDto.patientId}`
--   )
--
-- This is a SQL injection vector if `patientId` is ever attacker-controlled and not strictly validated
-- upstream as a numeric id. The safe parameterized equivalent (what it SHOULD be) is:
SELECT FullName
FROM dbo.Patients
WHERE PatientId = @patientId;   -- @patientId: bigint, passed as a bound parameter, never concatenated
