-- Table: dbo.DoctorAssignments
-- Source: reconstructed from src/entities/doctor-assignment.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: admin (assignDoctor/revokeAssignment/getAssignments*).

CREATE TABLE dbo.DoctorAssignments (
    AssignmentId      BIGINT IDENTITY(1,1) NOT NULL,
    BookingId         BIGINT       NOT NULL,  -- FK -> Bookings.BookingId
    DoctorId          BIGINT       NOT NULL,  -- FK -> Doctors.DoctorId
    AssignedBy        BIGINT       NULL,      -- AdminUsers.AdminId, not a TypeORM relation
    AssignedDate      DATETIME     NOT NULL CONSTRAINT DF_DoctorAssignments_AssignedDate DEFAULT (GETDATE()),
    AssignmentStatus  VARCHAR(50)  NOT NULL CONSTRAINT DF_DoctorAssignments_AssignmentStatus DEFAULT ('Active'),
    CONSTRAINT PK_DoctorAssignments PRIMARY KEY (AssignmentId),
    CONSTRAINT FK_DoctorAssignments_Bookings FOREIGN KEY (BookingId) REFERENCES dbo.Bookings (BookingId),
    CONSTRAINT FK_DoctorAssignments_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId)
);

-- Notes: AssignmentStatus is 'Active' or 'Revoked'. AdminService.assignDoctor blocks assigning a second
-- active doctor to the same booking without revoking the first. Assigning sets Bookings.DoctorId +
-- Bookings.BookingStatus = 'DoctorAssigned'; revoking resets Bookings.BookingStatus = 'PaymentVerified'.
