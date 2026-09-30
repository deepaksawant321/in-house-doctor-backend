-- Table: dbo.AdminUsers
-- Source of truth: src/entities/admin-user.entity.ts (TypeORM).
-- Referenced by modules: admin (login, audit).
-- Live status: migrated 2026-09-29 — MobileNo widened and UQ_AdminUsers_Email added.

CREATE TABLE dbo.AdminUsers (
    AdminId        BIGINT IDENTITY(1,1) NOT NULL,
    FullName       NVARCHAR(100) NOT NULL,
    MobileNo       VARCHAR(20)   NULL,
    Email          NVARCHAR(255) NOT NULL,
    PasswordHash   NVARCHAR(255) NOT NULL,
    RoleName       VARCHAR(50)   NOT NULL CONSTRAINT DF_AdminUsers_RoleName DEFAULT ('Admin'),
    IsActive       BIT           NOT NULL CONSTRAINT DF_AdminUsers_IsActive DEFAULT (1),
    CreatedDate    DATETIME      NOT NULL CONSTRAINT DF_AdminUsers_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_AdminUsers PRIMARY KEY (AdminId),
    CONSTRAINT UQ_AdminUsers_Email UNIQUE (Email)
);

-- Known code-level issue (unchanged by this migration): repo-root script `seed-admin.ts` inserts an
-- `updatedDate` field that does not exist on the AdminUser entity — silently dropped by TypeORM's
-- insert().

-- Still open: Email/PasswordHash/RoleName remain nullable live and RoleName has no DB-level default —
-- these weren't part of the applied migration (app always sets them explicitly, so low priority; add if
-- you want DB-level enforcement).
