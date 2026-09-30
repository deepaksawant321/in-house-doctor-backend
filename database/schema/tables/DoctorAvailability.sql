-- Table: dbo.DoctorAvailability
-- Source of truth: src/entities/doctor-availability.entity.ts (TypeORM).
-- Referenced by modules: doctor-availability.
-- Live status: MIGRATED 2026-09-29 — matches this definition. Old data preserved in
-- dbo.DoctorAvailability_Legacy (see that file) since a specific date+slot has no clean mapping to a
-- recurring day-of-week rule; see ../../migrations/pending-migrations.md section 1b.

CREATE TABLE dbo.DoctorAvailability (
    Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_DoctorAvailability_Id DEFAULT (NEWID()),
    DoctorId      BIGINT   NOT NULL,   -- FK -> Doctors.DoctorId
    DayOfWeek     INT      NOT NULL,   -- 0 = Sunday .. 6 = Saturday (recurring weekly slot)
    StartTime     TIME     NOT NULL,
    EndTime       TIME     NOT NULL,
    IsAvailable   BIT      NOT NULL CONSTRAINT DF_DoctorAvailability_IsAvailable DEFAULT (1),
    CONSTRAINT PK_DoctorAvailability PRIMARY KEY (Id),
    CONSTRAINT FK_DoctorAvailability_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId)
);
