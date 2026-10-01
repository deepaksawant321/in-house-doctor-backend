-- QA hardening (apply manually after checking for existing violations). Not run automatically.
-- 1) Backstop for double-booking races: one live booking per patient/date/slot.
--    (The API also serialises per patient in-process; this index makes it safe across instances.)
--    Check first:  SELECT PatientId, PreferredDate, PreferredTime, COUNT(*) FROM Bookings
--                  WHERE BookingStatus <> 'Cancelled' GROUP BY PatientId, PreferredDate, PreferredTime HAVING COUNT(*) > 1;
CREATE UNIQUE INDEX UX_Bookings_Patient_Date_Slot ON Bookings (PatientId, PreferredDate, PreferredTime)
  WHERE BookingStatus <> 'Cancelled';
-- 2) Referential integrity (check for orphans first: ServiceId / AddressId values with no parent row).
-- ALTER TABLE Bookings ADD CONSTRAINT FK_Bookings_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId);
-- ALTER TABLE Bookings ADD CONSTRAINT FK_Bookings_Addresses FOREIGN KEY (AddressId) REFERENCES UserAddresses(AddressId);
-- 3) Lookup indexes
CREATE INDEX IX_Bookings_UserId ON Bookings (UserId);
CREATE INDEX IX_Notifications_UserId ON Notifications (UserId);
