-- Table: dbo.OTPVerifications
-- Source: reconstructed from src/entities/otp-verification.entity.ts + src/migrate-db.ts
-- (TypeORM, synchronize=false). Verification: NOT confirmed against a live database this session.
-- Referenced by modules: otp, auth (login/register/verify flows).

CREATE TABLE dbo.OTPVerifications (
    OTPId         BIGINT IDENTITY(1,1) NOT NULL,
    UserId        VARCHAR(50)   NULL,   -- free-text id, NOT a TypeORM/DB relation
    Email         VARCHAR(150)  NULL,   -- added by migrate-db.ts
    MobileNo      VARCHAR(20)   NULL,
    OTPHash       VARCHAR(255)  NOT NULL,  -- added by migrate-db.ts; SHA-256 hex digest of the OTP (see OtpService.hashOtp)
    Purpose       VARCHAR(50)   NOT NULL,  -- added by migrate-db.ts, e.g. 'LOGIN', 'REGISTER'
    Channel       VARCHAR(50)   NOT NULL,  -- added by migrate-db.ts, 'EMAIL' | 'SMS'
    ExpiresAt     DATETIME      NOT NULL,
    IsVerified    BIT           NOT NULL CONSTRAINT DF_OTPVerifications_IsVerified DEFAULT (0), -- mapped to `isUsed` in app code
    AttemptCount  INT           NOT NULL CONSTRAINT DF_OTPVerifications_AttemptCount DEFAULT (0),  -- added by migrate-db.ts
    VerifiedAt    DATETIME      NULL,     -- added by migrate-db.ts
    IPAddress     VARCHAR(50)   NULL,     -- added by migrate-db.ts
    UserAgent     VARCHAR(255)  NULL,     -- added by migrate-db.ts
    CreatedDate   DATETIME      NOT NULL CONSTRAINT DF_OTPVerifications_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_OTPVerifications PRIMARY KEY (OTPId)
);

-- Notes: OtpService enforces a 60-second resend cooldown and a 5-per-day rate limit per (target, purpose)
-- via ad hoc createQueryBuilder WHERE clauses against this table (see database/queries/otp-*.sql).
-- OTP codes are never stored in plaintext — only the SHA-256 hash (OTPHash).
