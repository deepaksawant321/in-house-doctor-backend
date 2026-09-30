-- Table: dbo.Payments
-- Source of truth: src/entities/payment.entity.ts (TypeORM).
-- Referenced by modules: payments, admin (verify), dashboard.
-- Live status: migrated 2026-09-29 — FK_Payments_Bookings and UQ_Payments_BookingId added; Remarks
-- widened to NVARCHAR(MAX).

CREATE TABLE dbo.Payments (
    PaymentId       BIGINT IDENTITY(1,1) NOT NULL,
    BookingId       BIGINT         NOT NULL,   -- FK -> Bookings.BookingId (OneToOne: one payment row per booking)
    Amount          DECIMAL(10,2)  NOT NULL,
    UPIReferenceNo  VARCHAR(100)   NULL,       -- mapped to `transactionId` in application code
    ScreenshotPath  NVARCHAR(500)  NULL,
    PaymentStatus   VARCHAR(50)    NOT NULL CONSTRAINT DF_Payments_PaymentStatus DEFAULT ('Pending'),
    VerifiedBy      BIGINT         NULL,
    VerifiedDate    DATETIME       NULL,
    Remarks         NVARCHAR(MAX)  NULL,
    CONSTRAINT PK_Payments PRIMARY KEY (PaymentId),
    CONSTRAINT UQ_Payments_BookingId UNIQUE (BookingId),
    CONSTRAINT FK_Payments_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId)
);

-- Notes:
-- * No CreatedDate/audit column by design (confirmed by AdminService.getAllPayments comment: "Filter by
--   verifiedDate instead since createdDate does not exist").
-- * PaymentStatus values observed in code: 'Pending', 'Pending Verification', 'Success', 'Rejected'.
-- * PaymentsService.initiatePayment is a MOCK gateway (auto-succeeds after 2s) — not a real integration.
-- * The "one payment per booking" invariant is now enforced by the DB (UQ_Payments_BookingId), not just
--   application code.
