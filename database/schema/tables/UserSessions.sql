-- Table: dbo.UserSessions
-- Source: reconstructed from src/entities/user-session.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: auth (loginWithOtp persists one row per login).

CREATE TABLE dbo.UserSessions (
    SessionId      BIGINT IDENTITY(1,1) NOT NULL,
    UserId         BIGINT        NOT NULL,  -- FK -> Users.UserId
    DeviceType     VARCHAR(50)   NULL,
    DeviceInfo     NVARCHAR(500) NULL,
    IPAddress      VARCHAR(100)  NULL,
    AccessToken    NVARCHAR(MAX) NULL,
    RefreshToken   NVARCHAR(MAX) NULL,
    ExpiresAt      DATETIME      NULL,
    IsActive       BIT           NULL CONSTRAINT DF_UserSessions_IsActive DEFAULT (1),
    CreatedDate    DATETIME      NOT NULL CONSTRAINT DF_UserSessions_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_UserSessions PRIMARY KEY (SessionId),
    CONSTRAINT FK_UserSessions_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);

-- Notes: DeviceType/DeviceInfo/IPAddress are defined but not populated anywhere in AuthService.loginWithOtp
-- (only user/accessToken/refreshToken/expiresAt/isActive are set) — likely intended for future
-- multi-device session tracking. AuthService never reads back from UserSessions (no session-based
-- logout/verification path uses this table beyond insert).
