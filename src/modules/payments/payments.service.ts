import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Booking } from '../../entities/booking.entity';
import { Notification } from '../../entities/notification.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

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
  ) {}

  async initiatePayment(initiatePaymentDto: InitiatePaymentDto): Promise<Payment> {
    const booking = await this.bookingRepo.findOne({
      where: { id: initiatePaymentDto.bookingId },
      relations: { patient: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const existingPayment = await this.paymentRepo.findOne({ where: { booking: { id: booking.id } } });
    if (existingPayment && existingPayment.status === 'Success') {
      throw new BadRequestException('Payment already completed for this booking');
    }

    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const payment = this.paymentRepo.create({
      booking,
      amount: initiatePaymentDto.amount,
      transactionId,
      status: 'Pending',
    });

    const savedPayment = await this.paymentRepo.save(payment);

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

    // Simulate a Mock Payment Gateway success callback after 2 seconds
    setTimeout(async () => {
      savedPayment.status = 'Success';
      await this.paymentRepo.save(savedPayment);
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
    }, 2000);

    return savedPayment;
  }

  async getPaymentStatus(transactionId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { transactionId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async uploadPaymentProof(bookingId: string, file: Express.Multer.File, amount: number, transactionId: string): Promise<Payment> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    let payment = await this.paymentRepo.findOne({ where: { booking: { id: bookingId } } });
    if (!payment) {
      payment = this.paymentRepo.create({
        booking,
        amount,
        transactionId,
        status: 'Pending',
      });
    }

    payment.screenshotPath = `/uploads/payments/${file.filename}`;
    payment.status = 'Pending Verification';
    
    return this.paymentRepo.save(payment);
  }

  async verifyPayment(paymentId: string, verifiedByAdminId: string, status: string, remarks?: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: { booking: true } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = status;
    payment.verifiedBy = verifiedByAdminId;
    payment.verifiedDate = new Date();
    payment.remarks = remarks || '';

    return this.paymentRepo.save(payment);
  }

  async getPaymentByBookingId(bookingId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({ where: { booking: { id: bookingId } } });
    if (!payment) throw new NotFoundException('Payment not found for this booking');
    return payment;
  }
}
