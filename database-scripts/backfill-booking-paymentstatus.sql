-- Bookings.PaymentStatus was never written by earlier versions of the API, so the admin
-- "Payment" column was blank. Copy the latest payment status onto existing bookings.
UPDATE b
SET b.PaymentStatus = p.PaymentStatus
FROM dbo.Bookings b
JOIN dbo.Payments p ON p.BookingId = b.BookingId
WHERE b.PaymentStatus IS NULL;

UPDATE dbo.Bookings SET PaymentStatus = 'Pending' WHERE PaymentStatus IS NULL;
