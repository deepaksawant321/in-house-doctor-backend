import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly adminEmail: string;
  private readonly fromName = 'InHouse Doctor';

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@inhousedoctor.com';
  }

  // ─── Core Send Helper ─────────────────────────────────────────────────────

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.mailerService.sendMail({ to, subject, html });
      this.logger.log(`Email sent to ${to}: "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
    }
  }

  // ─── HTML Template Builder ─────────────────────────────────────────────────

  private template(title: string, bodyHtml: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 0; background: #f0f4ff; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(79,70,229,0.10); }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #0D9488 100%); padding: 28px 32px; }
    .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
    .body { padding: 32px; color: #1e293b; }
    .body h2 { margin: 0 0 12px; font-size: 20px; color: #4F46E5; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #e8ecf5; }
    .info-table td:first-child { color: #64748b; font-weight: 600; width: 40%; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger  { background: #fee2e2; color: #991b1b; }
    .badge-info    { background: #e0e7ff; color: #3730a3; }
    .cta { text-align: center; margin: 28px 0 8px; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #4F46E5, #0D9488); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .footer { background: #f8fafc; border-top: 1px solid #e8ecf5; padding: 18px 32px; text-align: center; color: #94a3b8; font-size: 12px; }
    .footer strong { color: #4F46E5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏥 InHouse Doctor</h1>
      <p>Premium Healthcare at Your Doorstep</p>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      Need help? Contact us at <strong>support@inhousedoctor.com</strong> or call <strong>9029190955</strong><br/>
      &copy; ${new Date().getFullYear()} InHouse Doctor. All rights reserved.
    </div>
  </div>
</body>
</html>`;
  }

  // ─── User Emails ────────────────────────────────────────────────────────────

  async sendPatientAdded(userEmail: string, patientName: string, relationship: string): Promise<void> {
    const html = this.template('Patient Added', `
      <h2>Patient Profile Added ✅</h2>
      <p>A new patient profile has been added to your account.</p>
      <table class="info-table">
        <tr><td>Patient Name</td><td><strong>${patientName}</strong></td></tr>
        <tr><td>Relationship</td><td>${relationship || '—'}</td></tr>
      </table>
      <p>You can now book appointments for this patient directly from your dashboard.</p>
    `);
    await this.send(userEmail, `Patient Profile Added — ${patientName}`, html);
  }

  async sendBookingConfirmation(
    userEmail: string,
    details: { bookingNo: string; patientName: string; service: string; scheduledDate: string; address: string },
  ): Promise<void> {
    const html = this.template('Booking Confirmed', `
      <h2>Booking Confirmed! 🎉</h2>
      <p>Your booking has been received. A doctor will be assigned shortly.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${details.bookingNo}</strong></td></tr>
        <tr><td>Patient</td><td>${details.patientName}</td></tr>
        <tr><td>Service</td><td>${details.service || '—'}</td></tr>
        <tr><td>Scheduled Date</td><td>${details.scheduledDate}</td></tr>
        <tr><td>Address</td><td>${details.address || '—'}</td></tr>
        <tr><td>Status</td><td><span class="badge badge-warning">Pending</span></td></tr>
      </table>
      <p>We will notify you once a doctor is assigned.</p>
    `);
    await this.send(userEmail, `Booking Confirmed — ${details.bookingNo}`, html);
  }

  async sendBookingStatusUpdate(
    userEmail: string,
    bookingNo: string,
    status: string,
    remarks?: string,
  ): Promise<void> {
    const badgeClass =
      status === 'Completed' ? 'badge-success' :
      status === 'Cancelled' ? 'badge-danger' :
      status === 'DoctorAssigned' ? 'badge-info' : 'badge-warning';

    const html = this.template('Booking Status Update', `
      <h2>Booking Status Updated</h2>
      <p>The status of your booking has been updated.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>New Status</td><td><span class="badge ${badgeClass}">${status}</span></td></tr>
        ${remarks ? `<tr><td>Remarks</td><td>${remarks}</td></tr>` : ''}
      </table>
      <p>Log in to your account to view full details.</p>
    `);
    await this.send(userEmail, `Booking ${status} — ${bookingNo}`, html);
  }

  async sendDoctorAssigned(
    userEmail: string,
    bookingNo: string,
    doctorName: string,
    scheduledDate: string,
  ): Promise<void> {
    const html = this.template('Doctor Assigned', `
      <h2>Doctor Assigned! 👨‍⚕️</h2>
      <p>Great news! A doctor has been assigned for your booking.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>Doctor</td><td><strong>${doctorName}</strong></td></tr>
        <tr><td>Scheduled Date</td><td>${scheduledDate}</td></tr>
        <tr><td>Status</td><td><span class="badge badge-info">Doctor Assigned</span></td></tr>
      </table>
      <p>Please ensure someone is available at the address at the scheduled time.</p>
    `);
    await this.send(userEmail, `Doctor Assigned — ${bookingNo}`, html);
  }

  async sendDoctorRevoked(userEmail: string, bookingNo: string): Promise<void> {
    const html = this.template('Doctor Assignment Update', `
      <h2>Doctor Reassignment in Progress</h2>
      <p>We have made a change to your booking. The previously assigned doctor has been removed and we are working to assign a new doctor as soon as possible.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>Status</td><td><span class="badge badge-warning">Reassigning Doctor</span></td></tr>
      </table>
      <p>We apologise for any inconvenience. You will receive another notification once a new doctor is confirmed.</p>
    `);
    await this.send(userEmail, `Doctor Reassignment — ${bookingNo}`, html);
  }

  async sendPaymentVerified(
    userEmail: string,
    bookingNo: string,
    amount: number,
    status: string,
    remarks?: string,
  ): Promise<void> {
    const isSuccess = status === 'Success';
    const html = this.template('Payment Update', `
      <h2>Payment ${isSuccess ? 'Verified ✅' : 'Update ⚠️'}</h2>
      <p>Your payment for booking <strong>${bookingNo}</strong> has been reviewed.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>Amount</td><td><strong>₹${amount}</strong></td></tr>
        <tr><td>Status</td><td><span class="badge ${isSuccess ? 'badge-success' : 'badge-danger'}">${status}</span></td></tr>
        ${remarks ? `<tr><td>Remarks</td><td>${remarks}</td></tr>` : ''}
      </table>
      ${isSuccess
        ? '<p>Your booking is now confirmed. Our team will be in touch soon.</p>'
        : '<p>Please contact our support team if you have any questions about your payment.</p>'
      }
    `);
    await this.send(userEmail, `Payment ${status} — ${bookingNo}`, html);
  }

  // ─── Admin Alert Emails ─────────────────────────────────────────────────────

  async sendAdminAlert(subject: string, bodyHtml: string): Promise<void> {
    const html = this.template(`Admin Alert: ${subject}`, `
      <h2>⚡ Admin Notification</h2>
      ${bodyHtml}
    `);
    await this.send(this.adminEmail, `[Admin] ${subject}`, html);
  }

  async sendAdminNewBooking(bookingNo: string, patientName: string, service: string, scheduledDate: string): Promise<void> {
    await this.sendAdminAlert(`New Booking — ${bookingNo}`, `
      <p>A new booking has been created and is awaiting your review.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>Patient</td><td>${patientName}</td></tr>
        <tr><td>Service</td><td>${service || '—'}</td></tr>
        <tr><td>Scheduled</td><td>${scheduledDate}</td></tr>
        <tr><td>Status</td><td><span class="badge badge-warning">Pending</span></td></tr>
      </table>
    `);
  }

  async sendAdminPaymentProofUploaded(bookingNo: string, amount: number, transactionId: string): Promise<void> {
    await this.sendAdminAlert(`Payment Proof Uploaded — ${bookingNo}`, `
      <p>A user has uploaded a payment screenshot for the following booking. Please verify.</p>
      <table class="info-table">
        <tr><td>Booking No.</td><td><strong>${bookingNo}</strong></td></tr>
        <tr><td>Amount</td><td>₹${amount}</td></tr>
        <tr><td>Transaction ID</td><td>${transactionId}</td></tr>
        <tr><td>Action Required</td><td><span class="badge badge-warning">Pending Verification</span></td></tr>
      </table>
    `);
  }
}
