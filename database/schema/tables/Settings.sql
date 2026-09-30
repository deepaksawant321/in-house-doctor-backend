-- Table: dbo.Settings
-- Source: reconstructed from src/entities/setting.entity.ts + src/migrate-settings.ts
-- (TypeORM, synchronize=false). Verification: NOT confirmed against a live database this session.
-- Referenced by modules: settings, admin (getSettings/updateSettings — a DUPLICATE implementation, see notes).

CREATE TABLE dbo.Settings (
    SettingId        INT IDENTITY(1,1) NOT NULL,
    SettingKey       NVARCHAR(255) NULL,
    SettingValue     NVARCHAR(255) NULL,
    companyName      NVARCHAR(255) NULL,   -- added by migrate-settings.ts
    supportEmail     NVARCHAR(255) NULL,   -- added by migrate-settings.ts
    supportPhone     NVARCHAR(255) NULL,   -- added by migrate-settings.ts
    whatsappNumber   NVARCHAR(255) NULL,   -- added by migrate-settings.ts
    primaryUpiId     NVARCHAR(255) NULL,   -- added by migrate-settings.ts
    qrCodeImage      NVARCHAR(MAX) NULL,   -- added by migrate-settings.ts AS nvarchar(MAX); entity has no
                                            -- explicit type/length, so ORM-inferred metadata would default
                                            -- to nvarchar(255) — a metadata/DB mismatch, unverified live.
    logoUrl          NVARCHAR(255) NULL,
    faviconUrl       NVARCHAR(255) NULL,
    socialFacebook   NVARCHAR(255) NULL,
    socialInstagram  NVARCHAR(255) NULL,
    socialTwitter    NVARCHAR(255) NULL,
    googleMapsLink   NVARCHAR(255) NULL,
    bookingPrefix    NVARCHAR(255) NULL,
    smsTemplates     NVARCHAR(MAX) NULL,
    emailTemplates   NVARCHAR(MAX) NULL,
    CONSTRAINT PK_Settings PRIMARY KEY (SettingId)
);

-- Notes:
-- * Singleton-style table: both SettingsService.getSettings() and AdminService.getSettings() do
--   `findOne({ where: {} })` (first row) and auto-create a default row if none exists — only one row is
--   ever expected to be read/used, though nothing prevents multiple rows from existing.
-- * DUPLICATE business logic: `settings` module (SettingsService) and `admin` module (AdminService) each
--   implement their own get/update against this same table independently — not shared code.
-- * logoUrl/faviconUrl/socialFacebook/etc. columns are referenced by the entity but their ALTER TABLE
--   origin was not found in the inspected migration scripts (migrate-settings.ts only adds companyName,
--   supportEmail, supportPhone, whatsappNumber, primaryUpiId, qrCodeImage) — these extra columns'
--   presence in the live DB is UNVERIFIED.
