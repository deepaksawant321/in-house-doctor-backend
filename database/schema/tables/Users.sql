-- Table: dbo.Users
-- Source of truth: src/entities/user.entity.ts (TypeORM).
-- Referenced by modules: auth, users, admin, bookings, patients (via User relation), dashboard.
-- Live status: fully matches this definition (migrated 2026-09-29; unused extra columns dropped 2026-09-30).

CREATE TABLE dbo.Users (
    UserId          BIGINT IDENTITY(1,1) NOT NULL,
    FullName        NVARCHAR(100)  NOT NULL,
    MobileNo        VARCHAR(20)    NOT NULL,
    Email           NVARCHAR(255)  NULL,
    IsVerified      BIT            NOT NULL CONSTRAINT DF_Users_IsVerified DEFAULT (0),
    Status          VARCHAR(50)    NOT NULL CONSTRAINT DF_Users_Status DEFAULT ('Active'),
    CreatedDate     DATETIME       NOT NULL CONSTRAINT DF_Users_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Users PRIMARY KEY (UserId),
    CONSTRAINT UQ_Users_MobileNo UNIQUE (MobileNo),
    CONSTRAINT UQ_Users_Email UNIQUE (Email)
);

-- Notes:
-- * Patient/OTP-based login auto-creates a "Guest User" row (see auth.service.ts sendOtpLogin) when no
--   existing user matches the identifier — Email is filled with a synthetic address for SMS-only signups.
-- * Relations into Users (Patients.UserId, Bookings.UserId, Notifications.UserId, RefreshTokens.UserId,
--   UserSessions.UserId, UserAddresses.UserId) are backed by real FK constraints live (added 2026-09-29).
-- * Previously had 3 extra live columns not mapped by the entity (ModifiedDate, LastLoginDate,
--   ProfileCompleted). Confirmed unused (zero rows populated) and dropped 2026-09-30 — see
--   ../../migrations/pending-migrations.md §5.
