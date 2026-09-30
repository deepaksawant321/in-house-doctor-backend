-- Table: dbo.Services
-- Source: reconstructed from src/entities/service.entity.ts + src/migrate-services.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: services, cms, bookings (Booking.serviceId, loose reference).

CREATE TABLE dbo.Services (
    ServiceId         INT IDENTITY(1,1) NOT NULL,
    ServiceName       NVARCHAR(200)  NULL,
    Description       NVARCHAR(MAX)  NULL,
    BasePrice         DECIMAL(10,2)  NULL,
    IsActive          BIT            NULL CONSTRAINT DF_Services_IsActive DEFAULT (1),
    Slug              NVARCHAR(100)  NULL,   -- added by migrate-services.ts (ALTER TABLE ... ADD)
    LongDescription   NVARCHAR(MAX)  NULL,   -- added by migrate-services.ts
    ImageUrl          NVARCHAR(500)  NULL,   -- added by migrate-services.ts
    CONSTRAINT PK_Services PRIMARY KEY (ServiceId)
);

-- Notes:
-- * Service does NOT extend BaseEntity — no CreatedDate/audit columns.
-- * Slug/LongDescription/ImageUrl were added after initial creation via the ad hoc script
--   src/migrate-services.ts, which also backfills slugs for 4 known seed services
--   (general-physician, nursing-care, physiotherapy, elder-care).
-- * Bookings.ServiceId references this table by convention only — not a TypeORM/DB-enforced FK.
