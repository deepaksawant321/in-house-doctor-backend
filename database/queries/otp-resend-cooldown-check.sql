-- Purpose: enforce a 60-second resend cooldown per (target, purpose) before issuing a new OTP.
-- Source: src/modules/otp/otp.service.ts — OtpService.generateOtp() (TypeORM QueryBuilder, not raw SQL
-- in the app, reproduced here as equivalent T-SQL for documentation purposes).
-- Params:
--   @target   varchar  — email address or phone number the OTP is being sent to
--   @purpose  varchar  — e.g. 'LOGIN', 'REGISTER'
SELECT TOP 1 *
FROM dbo.OTPVerifications otp
WHERE (otp.Email = @target OR otp.MobileNo = @target)
  AND otp.Purpose = @purpose
  AND otp.CreatedDate > DATEADD(SECOND, -60, GETDATE());
-- If a row is returned, the caller throws BadRequestException('Please wait 60 seconds before requesting another OTP').
