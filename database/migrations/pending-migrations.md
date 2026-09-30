# Migrations — applied 2026-09-29

**Status: APPLIED.** Everything below was run against the live database
(`DESKTOP-GKN0UQE\SQLEXPRESS` / `InHouseDoctorDB`, Windows Trusted Connection) on 2026-09-29. Every
statement succeeded — no skips, no failures. This file is kept as a historical record of what changed and
why; the tables it describes now match the code (see each file under
[../schema/tables/](../schema/tables/), which no longer carries a "Live DB status" gap note).

Verified after running:
- **27 → tables**: `StaticPages` created; `DoctorAvailability` rebuilt to the code's shape; old data
  preserved in the new `DoctorAvailability_Legacy` table (see
  [../schema/tables/DoctorAvailability_Legacy.sql](../schema/tables/DoctorAvailability_Legacy.sql)).
- **FK constraints: 1 → 19** (every relation listed in section 2 below now exists live).
- **Unique constraints: 2 → 6** (`UQ_Users_Email`, `UQ_AdminUsers_Email`, `UQ_Payments_BookingId` added;
  pre-flight checks found zero duplicate-data conflicts, so all three applied cleanly).
- **Column widenings**: all six applied (`Payments.Remarks` and `BookingStatusHistory.Remarks` are now
  `NVARCHAR(MAX)`, closing the truncation risk; `Bookings.BookingNo`, `Users.MobileNo`/`Email`,
  `AdminUsers.MobileNo` widened to match the entities).

## 1. Highest priority — was breaking live endpoints, now fixed

### 1a. `StaticPages` — created ✅

```sql
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StaticPages')
CREATE TABLE dbo.StaticPages (
    PageId          INT IDENTITY(1,1) NOT NULL,
    Title           NVARCHAR(255) NOT NULL,
    Slug            NVARCHAR(255) NOT NULL,
    HtmlContent     NVARCHAR(MAX) NOT NULL,
    SeoTitle        NVARCHAR(255) NULL,
    SeoDescription  NVARCHAR(500) NULL,
    IsPublished     BIT NOT NULL CONSTRAINT DF_StaticPages_IsPublished DEFAULT (1),
    CONSTRAINT PK_StaticPages PRIMARY KEY (PageId),
    CONSTRAINT UQ_StaticPages_Slug UNIQUE (Slug)
);
```

### 1b. `DoctorAvailability` — rebuilt ✅

The old table (date+slot shape) was renamed to `DoctorAvailability_Legacy` rather than dropped, since its
data had no clean 1:1 mapping to the new day-of-week+time-range shape. It is empty of *new* data going
forward but its historical rows are preserved for manual reconciliation if ever needed.

```sql
EXEC sp_rename 'dbo.DoctorAvailability', 'DoctorAvailability_Legacy';

CREATE TABLE dbo.DoctorAvailability (
    Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_DoctorAvailability_Id DEFAULT (NEWID()),
    DoctorId     BIGINT NOT NULL,
    DayOfWeek    INT NOT NULL,
    StartTime    TIME NOT NULL,
    EndTime      TIME NOT NULL,
    IsAvailable  BIT NOT NULL CONSTRAINT DF_DoctorAvailability_IsAvailable DEFAULT (1),
    CONSTRAINT PK_DoctorAvailability PRIMARY KEY (Id),
    CONSTRAINT FK_DoctorAvailability_Doctors FOREIGN KEY (DoctorId) REFERENCES dbo.Doctors (DoctorId)
);
```

**Follow-up still needed**: any doctors who had recurring availability under the old date+slot system
will show as having none until re-entered through the current UI (or a one-off data migration is written
by whoever owns the historical `DoctorAvailability_Legacy` rows).

## 2. Data-integrity gaps — closed ✅ (19 FKs, 3 new unique constraints)

All of the following were confirmed present live after the run (see `../schema/relationships.md` and
`../schema/indexes/README.md` for the current, up-to-date picture — they no longer need this file's
caveats repeated):

```
UQ_Users_Email, UQ_AdminUsers_Email, UQ_Payments_BookingId,
FK_Bookings_Users, FK_Bookings_Doctors, FK_Payments_Bookings,
FK_MedicalRecords_Patients, FK_MedicalRecords_Doctors, FK_MedicalRecords_Bookings,
FK_BookingStatusHistory_Bookings, FK_Patients_Users, FK_Prescriptions_Bookings,
FK_DoctorAssignments_Bookings, FK_DoctorAssignments_Doctors, FK_DoctorCoverageAreas_Doctors,
FK_UserAddresses_Users, FK_RefreshTokens_Users, FK_UserSessions_Users,
FK_Notifications_Bookings, FK_Notifications_Users
(plus the pre-existing FK_Bookings_Patient and FK_DoctorAvailability_Doctors from the rebuild above)
```

## 3. Column-width fixes — applied ✅

```sql
ALTER TABLE dbo.Payments ALTER COLUMN Remarks NVARCHAR(MAX) NULL;
ALTER TABLE dbo.BookingStatusHistory ALTER COLUMN Remarks NVARCHAR(MAX) NULL;
ALTER TABLE dbo.Bookings ALTER COLUMN BookingNo VARCHAR(50) NULL;
ALTER TABLE dbo.Users ALTER COLUMN MobileNo VARCHAR(20) NOT NULL;
ALTER TABLE dbo.Users ALTER COLUMN Email NVARCHAR(255) NULL;
ALTER TABLE dbo.AdminUsers ALTER COLUMN MobileNo VARCHAR(20) NULL;
```

## 4. Was open, now resolved — see §5

The four items below were originally left as "needs a decision" rather than a mechanical migration.
Investigation on 2026-09-30 (row counts, data samples) found all four unused/empty, and they were
dropped — see §5.

## 5. Cleanup applied 2026-09-30

Investigated each remaining open item against the live data before touching anything:

| Item | Data found | Verdict |
|---|---|---|
| `dbo.UserNotifications` | 0 rows | Not usable — dropped |
| `dbo.DoctorAvailability_Legacy` | 0 rows (the pre-migration table was already empty — nothing was ever at risk of being lost in §1b) | Not usable — dropped |
| `Users.ModifiedDate` / `LastLoginDate` / `ProfileCompleted` | 1 user row; all three unpopulated (`ProfileCompleted` always `false`) | Not usable — dropped |
| `MedicalRecords.FilePath` / `UploadedDate` | 1 record row; `FilePath` NULL, `UploadedDate` only ever set by its own `DEFAULT GETDATE()` (identical to `CreatedDate`, never written by app code) | Not usable — dropped |

```sql
DROP TABLE dbo.UserNotifications;
DROP TABLE dbo.DoctorAvailability_Legacy;

ALTER TABLE dbo.Users DROP CONSTRAINT DF_Users_ModifiedDate;   -- (or whatever the live default's auto-name was)
ALTER TABLE dbo.Users DROP COLUMN ModifiedDate;
ALTER TABLE dbo.Users DROP CONSTRAINT DF_Users_LastLoginDate;
ALTER TABLE dbo.Users DROP COLUMN LastLoginDate;
ALTER TABLE dbo.Users DROP CONSTRAINT DF_Users_ProfileCompleted;
ALTER TABLE dbo.Users DROP COLUMN ProfileCompleted;

ALTER TABLE dbo.MedicalRecords DROP CONSTRAINT DF_MedicalRecords_UploadedDate;
ALTER TABLE dbo.MedicalRecords DROP COLUMN UploadedDate;
ALTER TABLE dbo.MedicalRecords DROP COLUMN FilePath;
```

Verified after running: live table count is now 25, exactly matching the 25 entities actually in use
(everything except the still-orphaned, still-nonexistent `SystemSettings`). `Users` columns are now
`UserId, FullName, MobileNo, Email, IsVerified, Status, CreatedDate` and `MedicalRecords` columns are now
`RecordId, PatientId, BookingId, RecordType, FileName, CreatedDate, Description, DoctorId, FileUrl` —
**both now match their entities exactly, column for column.**

**The live database now matches the application code in full**, with the sole remaining (and
intentional) exception of `dbo.SystemSettings`, which doesn't exist live and isn't used by any code
either — fully consistent, no action needed unless that entity is adopted for a real feature.
