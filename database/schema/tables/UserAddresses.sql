-- Table: dbo.UserAddresses
-- Source: reconstructed from src/entities/user-address.entity.ts (TypeORM, synchronize=false).
-- Verification: NOT confirmed against a live database this session.
-- Referenced by modules: addresses, users (legacy /users/address endpoints), bookings (Booking.addressId, loose reference).

CREATE TABLE dbo.UserAddresses (
    AddressId      BIGINT IDENTITY(1,1) NOT NULL,
    UserId         BIGINT         NOT NULL,  -- FK -> Users.UserId
    AddressLine1   NVARCHAR(500)  NULL,
    AddressLine2   NVARCHAR(500)  NULL,
    Area           NVARCHAR(200)  NULL,
    City           NVARCHAR(100)  NULL,
    State          NVARCHAR(100)  NULL,
    Pincode        VARCHAR(10)    NULL,
    Landmark       NVARCHAR(200)  NULL,
    IsDefault      BIT            NOT NULL CONSTRAINT DF_UserAddresses_IsDefault DEFAULT (0),
    CreatedDate    DATETIME       NOT NULL CONSTRAINT DF_UserAddresses_CreatedDate DEFAULT (GETDATE()),
    CONSTRAINT PK_UserAddresses PRIMARY KEY (AddressId),
    CONSTRAINT FK_UserAddresses_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (UserId)
);

-- Notes: AddressesService.unsetOtherDefaults() enforces "one default address per user" at the
-- application level (bulk UPDATE ... SET IsDefault = 0) — there is no DB-level partial unique index
-- enforcing this. Two modules expose overlapping endpoints against this table: `addresses` (full CRUD +
-- setDefault) and `users` (legacy addAddress/getAddresses under /users/address).
