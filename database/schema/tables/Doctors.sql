-- Table: dbo.Doctors
-- Source: reconstructed from src/entities/doctor.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: doctors, doctor-availability, admin, bookings, medical-records.

CREATE TABLE dbo.Doctors (
    DoctorId          BIGINT IDENTITY(1,1) NOT NULL,
    DoctorName         NVARCHAR(100)  NOT NULL,
    MobileNo           VARCHAR(20)    NOT NULL,
    Email              NVARCHAR(255)  NULL,
    Qualification      NVARCHAR(100)  NULL,
    Specialization      NVARCHAR(100) NOT NULL,
    ExperienceYears     INT           NOT NULL,
    ConsultationFee     DECIMAL(10,2) NOT NULL,
    Status              VARCHAR(50)   NOT NULL CONSTRAINT DF_Doctors_Status DEFAULT ('Active'),
    IsAvailable         BIT           NOT NULL CONSTRAINT DF_Doctors_IsAvailable DEFAULT (1),
    CreatedDate         DATETIME      NOT NULL CONSTRAINT DF_Doctors_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Doctors PRIMARY KEY (DoctorId)
);

-- Notes:
-- * Status is used for soft enable/disable (Active/Inactive) via AdminService.toggleDoctorStatus.
-- * IsAvailable is a separate same-day/on-duty flag, distinct from Status (doctors.service.ts.updateAvailability).
-- * Coverage areas are a separate 1:N table (DoctorCoverageAreas), not a column here — doctors.service.ts
--   findByPincode() joins through it.
