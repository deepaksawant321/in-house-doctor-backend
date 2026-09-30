-- Table: dbo.MedicalRecords
-- Source of truth: src/entities/medical-record.entity.ts (TypeORM).
-- Referenced by modules: medical-records.
-- Live status: fully matches this definition (FKs added 2026-09-29; unused legacy columns dropped 2026-09-30).

CREATE TABLE dbo.MedicalRecords (
    RecordId       BIGINT IDENTITY(1,1) NOT NULL,
    PatientId      BIGINT        NOT NULL,  -- FK -> Patients.PatientId
    DoctorId       BIGINT        NULL,      -- FK -> Doctors.DoctorId
    BookingId      BIGINT        NULL,      -- FK -> Bookings.BookingId
    FileUrl        NVARCHAR(1000) NOT NULL,
    FileName       NVARCHAR(255) NULL,
    Description    NVARCHAR(MAX) NULL,
    RecordType     VARCHAR(50)   NULL,
    CreatedDate    DATETIME      NOT NULL CONSTRAINT DF_MedicalRecords_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_MedicalRecords PRIMARY KEY (RecordId),
    CONSTRAINT FK_MedicalRecords_Patients FOREIGN KEY (PatientId) REFERENCES dbo.Patients (PatientId),
    CONSTRAINT FK_MedicalRecords_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId),
    CONSTRAINT FK_MedicalRecords_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId)
);

-- Notes: files are stored under /uploads/MedicalRecords/ on local disk (served via ServeStaticModule),
-- not a blob store. MedicalRecordsService.remove() deletes the DB row but not the underlying file.
-- Previously had 2 extra live columns not mapped by the entity (FilePath, UploadedDate). Confirmed unused
-- (FilePath was NULL on every row; UploadedDate was only ever populated by its own DEFAULT GETDATE(),
-- never by app code, and was identical to CreatedDate) and dropped 2026-09-30 — see
-- ../../migrations/pending-migrations.md §5.
