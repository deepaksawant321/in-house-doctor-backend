-- Purpose: enforce a maximum of 5 OTP requests per (target, purpose) per rolling 24-hour window.
-- Source: src/modules/otp/otp.service.ts — OtpService.generateOtp().
-- Params:
--   @target   varchar
--   @purpose  varchar
SELECT COUNT(*) AS cnt
FROM dbo.OTPVerifications otp
WHERE (otp.Email = @target OR otp.MobileNo = @target)
  AND otp.Purpose = @purpose
  AND otp.CreatedDate > DATEADD(HOUR, -24, GETDATE());
-- If cnt >= 5, the caller throws BadRequestException('Maximum daily OTP limit reached...').
