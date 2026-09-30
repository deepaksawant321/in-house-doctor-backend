-- Table: dbo.RefreshTokens
-- Source: reconstructed from src/entities/refresh-token.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: auth (loginWithOtp / refreshToken / logout).

CREATE TABLE dbo.RefreshTokens (
    RefreshTokenId  BIGINT IDENTITY(1,1) NOT NULL,
    UserId          BIGINT        NULL,   -- FK -> Users.UserId
    Token           NVARCHAR(MAX) NULL,   -- raw JWT string (not hashed)
    ExpiryDate      DATETIME      NULL,
    IsRevoked       BIT           NULL CONSTRAINT DF_RefreshTokens_IsRevoked DEFAULT (0),
    CreatedDate     DATETIME      NOT NULL CONSTRAINT DF_RefreshTokens_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_RefreshTokens PRIMARY KEY (RefreshTokenId),
    CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);

-- Notes: refresh tokens are stored as full JWTs (7-day expiry) rather than opaque/hashed tokens.
-- AuthService.logout looks up by exact token string match and sets IsRevoked = 1.
