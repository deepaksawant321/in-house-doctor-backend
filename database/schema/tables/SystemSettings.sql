-- Table: dbo.SystemSettings
-- Source of truth: src/entities/system-setting.entity.ts (TypeORM). This is what the CODE
-- expects/requires — though see note below, nothing currently uses it.
-- Referenced by modules: NONE — no `@InjectRepository(SystemSetting)` anywhere under src/modules.

CREATE TABLE dbo.SystemSettings (
    Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_SystemSettings_Id DEFAULT (NEWID()),
    SettingKey    VARCHAR(100)   NOT NULL,
    SettingValue  NVARCHAR(MAX)  NULL,
    Category      VARCHAR(100)   NULL,
    Description   NVARCHAR(500)  NULL,
    CreatedAt     DATETIME       NOT NULL CONSTRAINT DF_SystemSettings_CreatedAt DEFAULT (GETDATE()),
    UpdatedAt     DATETIME       NOT NULL,
    CONSTRAINT PK_SystemSettings PRIMARY KEY (Id),
    CONSTRAINT UQ_SystemSettings_SettingKey UNIQUE (SettingKey)
);

-- This entity is orphaned in the application code — nothing reads or writes it. The settings singleton
-- actually in use is `dbo.Settings` (see Settings.sql). Low priority: either wire this entity up to a
-- real feature, or remove it from the codebase.

-- Live DB status (checked 2026-09-28 against DESKTOP-GKN0UQE\SQLEXPRESS / InHouseDoctorDB): table does
-- not exist live — consistent with it being unused in code. No migration needed unless this entity is
-- adopted for a real feature.
