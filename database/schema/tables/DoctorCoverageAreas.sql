-- Table: dbo.DoctorCoverageAreas
-- Source: reconstructed from src/entities/doctor-coverage-area.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: doctors (createDoctor/updateDoctor/findByPincode).

CREATE TABLE dbo.DoctorCoverageAreas (
    CoverageId   BIGINT IDENTITY(1,1) NOT NULL,
    DoctorId     BIGINT        NOT NULL,  -- FK -> Doctors.DoctorId
    AreaName     NVARCHAR(100) NOT NULL,
    CONSTRAINT PK_DoctorCoverageAreas PRIMARY KEY (CoverageId),
    CONSTRAINT FK_DoctorCoverageAreas_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId)
);

-- Notes: source comment in doctor-coverage-area.entity.ts explicitly states "Pincode and City don't
-- exist in the actual DB schema" — AreaName is overloaded to hold a pincode value in practice
-- (doctors.service.ts.findByPincode matches AreaName === pincode). Confirms this entity was
-- hand-verified against the real table at some point (a useful, if informal, source of truth).
