-- Table: dbo.OTPLogs
-- Source: reconstructed from src/entities/otplog.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: otp (repository injected, but see note below).

CREATE TABLE dbo.OTPLogs (
    OTPLogId          BIGINT IDENTITY(1,1) NOT NULL,
    MobileNo          VARCHAR(15)   NULL,
    OTPCode           VARCHAR(10)   NULL,
    ProviderName      VARCHAR(50)   NULL,
    ProviderResponse  NVARCHAR(MAX) NULL,
    SMSStatus         VARCHAR(50)   NULL,
    SentDate          DATETIME      NOT NULL CONSTRAINT DF_OTPLogs_SentDate DEFAULT (GETDATE()),
    CONSTRAINT PK_OTPLogs PRIMARY KEY (OTPLogId)
);

-- Known issue: OtpService injects this repository (`otpLogRepo`) but no method in the codebase actually
-- writes to it — SmsOtpProvider.sendOtp() is a stub that only logs to the app logger and never persists
-- an OTPLogs row. This table currently appears to be write-dead application-side (see
-- database/DATABASE_CONTEXT.md Known Issues). Whether it has historical data is unverified without live
-- DB access.
