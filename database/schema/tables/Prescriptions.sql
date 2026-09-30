-- Table: dbo.Prescriptions
-- Source: reconstructed from src/entities/prescription.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: bookings (uploadPrescription / getPrescriptions).

CREATE TABLE dbo.Prescriptions (
    PrescriptionId  BIGINT IDENTITY(1,1) NOT NULL,
    BookingId       BIGINT        NOT NULL,  -- FK -> Bookings.BookingId
    FileName        NVARCHAR(255) NOT NULL,
    FilePath        NVARCHAR(500) NOT NULL,  -- relative path under /uploads, forward-slash normalized
    UploadedDate    DATETIME      NOT NULL CONSTRAINT DF_Prescriptions_UploadedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Prescriptions PRIMARY KEY (PrescriptionId),
    CONSTRAINT FK_Prescriptions_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId)
);
