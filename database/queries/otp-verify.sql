-- Purpose: validate a submitted OTP code against the latest unused, unexpired, matching hash.
-- Source: src/modules/otp/otp.service.ts — OtpService.verifyOtp().
-- Params:
--   @target   varchar  — email address or phone number
--   @otpHash  varchar  — SHA-256 hex digest of the submitted OTP code (hashed in application code,
--                        never compared in plaintext)
--   @purpose  varchar
SELECT TOP 1 *
FROM dbo.OTPVerifications otp
WHERE (otp.Email = @target OR otp.MobileNo = @target)
  AND otp.OTPHash = @otpHash
  AND otp.Purpose = @purpose
  AND otp.IsVerified = 0            -- IsVerified column is mapped to `isUsed` in application code
  AND otp.ExpiresAt > GETDATE()
ORDER BY otp.CreatedDate DESC;
-- On match: sets IsVerified = 1, VerifiedAt = current time. On no match: throws
-- BadRequestException('Invalid or expired OTP').
