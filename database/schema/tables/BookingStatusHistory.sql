-- Table: dbo.BookingStatusHistory
-- Source of truth: src/entities/booking-status-history.entity.ts (TypeORM).
-- Referenced by modules: bookings (audit trail on every status change).
-- Live status: migrated 2026-09-29 — FK_BookingStatusHistory_Bookings added; Remarks widened to
-- NVARCHAR(MAX).

CREATE TABLE dbo.BookingStatusHistory (
    HistoryId     BIGINT IDENTITY(1,1) NOT NULL,
    BookingId     BIGINT        NOT NULL,   -- FK -> Bookings.BookingId
    OldStatus     VARCHAR(50)   NULL,
    NewStatus     VARCHAR(50)   NOT NULL,
    Remarks       NVARCHAR(MAX) NULL,
    ChangedBy     BIGINT        NULL,
    ChangedDate   DATETIME      NOT NULL CONSTRAINT DF_BookingStatusHistory_ChangedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_BookingStatusHistory PRIMARY KEY (HistoryId),
    CONSTRAINT FK_BookingStatusHistory_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId)
);

-- Notes: written by BookingsService.createBooking (initial entry) and BookingsService.updateStatus on
-- every transition. AdminService.verifyPayment/assignDoctor mutate Booking.status directly WITHOUT
-- writing a history row (see comment in admin.service.ts verifyPayment) — so this table does not
-- capture 100% of status transitions.
