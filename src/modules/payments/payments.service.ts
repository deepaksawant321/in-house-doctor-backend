import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { EmailService } from '../../common/email/email.service';
import { Service } from '../../entities/service.entity';
import { isAdminUser } from '../../common/utils/roles';

type AuthUser = { id: string; role?: string };
const NUMERIC_ID = /^\d{1,18}$/;
export const VERIFY_STATUSES = ['Success', 'Rejected', 'Failed', 'Pending', 'Pending Verification'];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private async loadOwnedBooking(user: AuthUser, bookingId: string): Promise<Booking> {
    if (!NUMERIC_ID.test(String(bookingId))) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations: { patient: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!isAdminUser(user) && booking.user?.id !== user.id) {
      throw new ForbiddenException('You do not have access to this booking');
    }
    return booking;
  }

  private async assertAmountMatchesService(booking: Booking, amount: number) {
    if (!booking.serviceId) return;
    const service = await this.bookingRepo.manager.findOne(Service, { where: { id: booking.serviceId } });
    if (service?.basePrice != null && Number(service.basePrice) !== Number(amount)) {
      throw new BadRequestException('Payment amount does not match the service price');
    }
  }

  /** The simulated gateway is dev-only: it needs MOCK_PAYMENT_GATEWAY=true AND a non-production NODE_ENV. */
  private isMockGatewayEnabled(): boolean {
    return (
      this.configService.get<string>('MOCK_PAYMENT_GATEWAY') === 'true' &&
      this.configService.get<string>('NODE_ENV') !== 'production'
    );
  }

  async initiatePayment(user: AuthUser, initiatePaymentDto: InitiatePaymentDto): Promise<Payment> {
    if (!this.isMockGatewayEnabled()) {
      // No online gateway is integrated: never fabricate a successful payment. Patients pay via UPI and upload proof.
      throw new BadRequestException('Online payment is not available. Please pay via UPI and upload your payment proof.');
    }
    const booking = await this.loadOwnedBooking(user, initiatePaymentDto.bookingId);
    await this.assertAmountMatchesService(booking, initiatePaymentDto.amount);

    const existingPayment = await this.paymentRepo.findOne({ where: { booking: { id: booking.id } } });
    if (existingPayment && existingPayment.status === 'Success') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const transactionId = 'TXN-' + randomBytes(6).toString('hex').toUpperCase();

    const payment = this.paymentRepo.create({
      booking,
      amount: initiatePaymentDto.amount,
      transactionId,
      status: 'Pending',
    });

    const savedPayment = await this.paymentRepo.save(payment);
    await this.bookingRepo.update(booking.id, { paymentStatus: 'Pending' });

    // Notify patient that payment is initiated
    await this.notificationRepo.save(
      this.notificationRepo.create({
        booking,
        recipient: booking.patient?.id ?? initiatePaymentDto.bookingId,
        notificationType: 'PaymentInitiated',
        message: `Payment of ₹${initiatePaymentDto.amount} initiated for booking ${booking.bookingNo}. Transaction ID: ${transactionId}.`,
        deliveryStatus: 'Sent',
      }),
    );

    // Simulated payment gateway (development only, see isMockGatewayEnabled): auto-marks Success after 2 seconds.
    setTimeout(async () => {
      try {
      savedPayment.status = 'Success';
      await this.paymentRepo.save(savedPayment);
      await this.bookingRepo.update(booking.id, { paymentStatus: 'Success' });
      this.logger.log(`[DEV MockGateway] Payment ${transactionId} marked as Success automatically.`);

      // Notify patient of payment success
      await this.notificationRepo.save(
        this.notificationRepo.create({
          booking,
          recipient: booking.patient?.id ?? initiatePaymentDto.bookingId,
          notificationType: 'PaymentSuccess',
          message: `Payment of ₹${initiatePaymentDto.amount} for booking ${booking.bookingNo} was successful. Transaction ID: ${transactionId}.`,
          deliveryStatus: 'Sent',
        }),
      );
      } catch (e) {
        this.logger.error('[MockGateway] Failed to finalise payment', e as any);
      }
    }, 2000);

    return savedPayment;
  }

  async getPaymentStatus(user: AuthUser, transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { transactionId }, relations: { booking: { user: true } } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!isAdminUser(user) && payment.booking?.user?.id !== user.id) throw new NotFoundException('Payment not found');
    return payment;
  }

  async uploadPaymentProof(user: AuthUser, bookingId: string, file: Express.Multer.File, amount: number, transactionId: string): Promise<Payment> {
    if (!file) throw new BadRequestException('A payment proof file is required');
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) throw new BadRequestException('A valid amount is required');
    if (!transactionId || !String(transactionId).trim() || String(transactionId).length > 100) {
      throw new BadRequestException('A valid transaction reference is required');
    }
    const booking = await this.loadOwnedBooking(user, bookingId);
    await this.assertAmountMatchesService(booking, amountNum);

    let payment = await this.paymentRepo.findOne({ where: { booking: { id: bookingId } } });
    if (!payment) {
      payment = this.paymentRepo.create({
        booking,
        amount: amountNum,
        transactionId,
        status: 'Pending',
      });
    } else if (payment.status === 'Success') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    payment.screenshotPath = `/uploads/payments/${file.filename}`;
    payment.status = 'Pending Verification';
    const savedPayment = await this.paymentRepo.save(payment);
    await this.bookingRepo.update(booking.id, { paymentStatus: 'Pending Verification' });

    // Notify admin that proof has been uploaded (non-blocking)
    try {
      await this.emailService.sendAdminPaymentProofUploaded(
        booking.bookingNo,
        Number(savedPayment.amount),
        savedPayment.transactionId,
      );
    } catch (e) {
      this.logger.error('Failed to send payment proof alert to admin', e);
    }

    return savedPayment;
  }

  async verifyPayment(paymentId: string, verifiedByAdminId: string, status: string, remarks?: string): Promise<Payment> {
    if (!VERIFY_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${VERIFY_STATUSES.join(', ')}`);
    }
    if (!NUMERIC_ID.test(String(paymentId))) throw new BadRequestException('Invalid payment id');
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: { booking: true } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    payment.verifiedBy = verifiedByAdminId;
    payment.verifiedDate = new Date();
    payment.remarks = remarks || '';

    // Email the user about payment verification result (non-blocking)
    try {
      const paymentWithUser = await this.paymentRepo.findOne({
        where: { id: paymentId },
        relations: { booking: { user: true } }
      });
      if (paymentWithUser?.booking?.user?.email) {
        await this.emailService.sendPaymentVerified(
          paymentWithUser.booking.user.email,
          payment.booking.bookingNo,
          Number(payment.amount),
          status,
          remarks,
        );
      }
    } catch (e) {
      this.logger.error('Failed to send payment verification email', e);
    }

    const saved = await this.paymentRepo.save(payment);
    if (payment.booking?.id) await this.bookingRepo.update(payment.booking.id, { paymentStatus: status });
    return saved;
  }

  async getPaymentByBookingId(user: AuthUser, bookingId: string): Promise<Payment> {
    await this.loadOwnedBooking(user, bookingId);
    const payment = await this.paymentRepo.findOne({ where: { booking: { id: bookingId } } });
    if (!payment) throw new NotFoundException('Payment not found for this booking');
    return payment;
  }
}
