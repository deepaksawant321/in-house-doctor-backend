-- Purpose: find a DoctorAssignment to revoke, matched either by its own id OR by the booking id of its
-- currently-Active assignment (lets the admin UI pass either an assignment id or a booking id).
-- Source: src/modules/admin/admin.service.ts — AdminService.revokeAssignment() (TypeORM QueryBuilder).
-- Params:
--   @id  — either a DoctorAssignments.AssignmentId or a Bookings.BookingId
SELECT TOP 1 a.*, b.*, u.*
FROM dbo.DoctorAssignments a
LEFT JOIN dbo.Bookings b ON b.BookingId = a.BookingId
LEFT JOIN dbo.Users u ON u.UserId = b.UserId
WHERE a.AssignmentId = @id
   OR (b.BookingId = @id AND a.AssignmentStatus = 'Active');
-- On match: sets AssignmentStatus = 'Revoked', resets Bookings.BookingStatus = 'PaymentVerified', and
-- (non-blocking) emails the booking's user that the doctor was revoked.
