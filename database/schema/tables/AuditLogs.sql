-- Table: dbo.AuditLogs
-- Source: reconstructed from src/entities/audit-log.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: audit-logs, admin (AdminService.audit() helper writes here).

CREATE TABLE dbo.AuditLogs (
    LogId        BIGINT IDENTITY(1,1) NOT NULL,
    UserType     VARCHAR(50)    NULL,   -- e.g. 'Admin'
    UserId       BIGINT         NULL,   -- acting admin/user id, not a TypeORM relation
    ActionName   NVARCHAR(200)  NULL,   -- e.g. AdminLogin, ToggleDoctorStatus, UpdateBookingStatus, VerifyPayment, UpdateSettings
    EntityName   NVARCHAR(200)  NULL,   -- e.g. AdminUsers, Doctors, Bookings, Payments, Settings
    EntityId     BIGINT         NULL,
    OldData      NVARCHAR(MAX)  NULL,   -- JSON-serialized snapshot before the change
    NewData      NVARCHAR(MAX)  NULL,   -- JSON-serialized snapshot after the change
    CreatedDate  DATETIME       NOT NULL CONSTRAINT DF_AuditLogs_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_AuditLogs PRIMARY KEY (LogId)
);

-- Notes: written exclusively via AdminService.audit(). There is a dedicated `audit-logs` module/controller
-- for reading this table, but only AdminService writes to it (no generic interceptor/decorator-based
-- audit trail across all mutating endpoints).
