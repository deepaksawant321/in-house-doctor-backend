-- Table: dbo.Bookings
-- Source of truth: src/entities/booking.entity.ts (TypeORM).
-- Referenced by modules: bookings, admin, dashboard, payments, medical-records, notifications.
-- Live status: migrated 2026-09-29 — FK_Bookings_Users and FK_Bookings_Doctors added (FK_Bookings_Patient
-- already existed); BookingNo widened to varchar(50).

CREATE TABLE dbo.Bookings (
    BookingId       BIGINT IDENTITY(1,1) NOT NULL,
    BookingNo       VARCHAR(50)     NULL,          -- app-generated, format 'BKG-<epoch-ms>'
    UserId          BIGINT          NULL,           -- FK -> Users.UserId (owner/creator)
    PatientId       BIGINT          NULL,           -- FK -> Patients.PatientId (who the visit is for)
    ServiceId       INT             NULL,           -- loose reference -> Services.ServiceId (NOT a TypeORM relation)
    AddressId       BIGINT          NULL,           -- loose reference -> UserAddresses.AddressId (NOT a TypeORM relation)
    DoctorId        BIGINT          NULL,           -- FK -> Doctors.DoctorId (assigned doctor)
    Symptoms        NVARCHAR(MAX)   NULL,
    PreferredDate   DATE            NOT NULL,
    PreferredTime   VARCHAR(20)     NULL,
    BookingStatus   VARCHAR(50)     NOT NULL CONSTRAINT DF_Bookings_BookingStatus DEFAULT ('Created'),
    PaymentStatus   VARCHAR(50)     NOT NULL CONSTRAINT DF_Bookings_PaymentStatus DEFAULT ('Pending'),
    Amount          DECIMAL(10,2)   NULL,
    CreatedDate     DATETIME        NOT NULL CONSTRAINT DF_Bookings_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Bookings PRIMARY KEY (BookingId),
    CONSTRAINT UQ_Bookings_BookingNo UNIQUE (BookingNo),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId),
    CONSTRAINT FK_Bookings_Patients FOREIGN KEY (PatientId) REFERENCES dbo.Patients (PatientId),
    CONSTRAINT FK_Bookings_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId)
);

-- Known code-level issues (unchanged by this migration — see BookingsService.createBooking /
-- DashboardService.getSummary / AdminService):
-- * BookingsService.createBooking hardcodes `status: 'Pending'` but the enum default/column default is
--   'Created' and 'Pending' is NOT a member of BookingStatus (common/enums/booking-status.enum.ts).
-- * DashboardService.getSummary filters upcoming visits on status = 'Confirmed', also not a valid
--   BookingStatus value (closest is 'DoctorConfirmed').
-- Valid BookingStatus values: Created, PaymentPending, PaymentVerified, DoctorAssigned, DoctorConfirmed,
-- VisitStarted, VisitCompleted, Cancelled.

-- Still live-only (not declared by the entity, kept as-is): a hand-added index IX_Bookings_PatientId,
-- and the pre-existing UQ__Bookings__... auto-named unique constraint on BookingNo (now also declared
-- explicitly above as UQ_Bookings_BookingNo would be redundant with the live auto-named one — no action
-- needed, both enforce the same thing).
