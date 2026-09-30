-- Table: dbo.Patients
-- Source: reconstructed from src/entities/patient.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: patients, bookings (Booking.patient), dashboard, medical-records.

CREATE TABLE dbo.Patients (
    PatientId         BIGINT IDENTITY(1,1) NOT NULL,
    UserId            BIGINT          NULL,   -- FK -> Users.UserId (ManyToOne, application-level)
    FullName          NVARCHAR(100)   NOT NULL,
    Age               INT             NULL,
    Gender            VARCHAR(20)     NULL,
    BloodGroup        VARCHAR(10)     NULL,
    Relationship      VARCHAR(50)     NULL,
    MobileNo          VARCHAR(20)     NULL,
    EmergencyContact  VARCHAR(20)     NULL,
    MedicalNotes      NVARCHAR(1000)  NULL,
    IsActive          BIT             NOT NULL CONSTRAINT DF_Patients_IsActive DEFAULT (1),
    CreatedDate       DATETIME        NOT NULL CONSTRAINT DF_Patients_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_Patients PRIMARY KEY (PatientId),
    CONSTRAINT FK_Patients_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);

-- Notes:
-- * "Relationship" describes the patient's relation to the account owner (e.g. Self, Parent, Child) —
--   populated from PatientsService.create / addPatient flows.
-- * patients.service.ts remove() catches FK-violation errors (SQL error 547) to return a 409 Conflict
--   when a patient has bookings/medical records referencing it — implies real FK enforcement is expected
--   at the DB level even though TypeORM sync is off (constraint likely created manually/historically).
