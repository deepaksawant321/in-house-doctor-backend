import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingStatusHistory } from '../../entities/booking-status-history.entity';
import { Prescription } from '../../entities/prescription.entity';
import { Notification } from '../../entities/notification.entity';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingStatusHistory)
    private historyRepo: Repository<BookingStatusHistory>,
    @InjectRepository(Prescription)
    private prescriptionRepo: Repository<Prescription>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private readonly mailerService: MailerService,
  ) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const scheduledDateObj = new Date(createBookingDto.scheduledDate);
    if (scheduledDateObj < new Date()) {
      throw new BadRequestException('Scheduled date cannot be in the past');
    }

    const existing = await this.bookingRepo.findOne({
      where: {
        patient: { id: createBookingDto.patientId } as any,
        scheduledDate: new Date(createBookingDto.scheduledDate),
        status: 'Pending'
      }
    });

    if (existing) {
      throw new ConflictException('Booking already exists for this patient at the scheduled time');
    }

    const booking = this.bookingRepo.create({
      bookingNo: `BKG-${Date.now()}`,
      user: { id: userId } as any,
      patient: { id: createBookingDto.patientId } as any,
      scheduledDate: new Date(createBookingDto.scheduledDate),
      symptoms: createBookingDto.symptoms,
      serviceId: createBookingDto.serviceId,
      addressId: createBookingDto.addressId,
      status: 'Pending',
    } as any);

    const savedBooking = await this.bookingRepo.save(booking) as unknown as Booking;

    // Log status history
    await this.historyRepo.save(
      this.historyRepo.create({
        booking: savedBooking,
        newStatus: 'Pending',
        remarks: 'Booking created successfully',
      }),
    );

    // Send notification
    await this.notificationRepo.save(
      this.notificationRepo.create({
        booking: savedBooking,
        user: { id: userId } as any,
        recipient: createBookingDto.patientId,
        notificationType: 'BookingCreated',
        message: `Your booking ${savedBooking.bookingNo} has been created and is pending confirmation.`,
        deliveryStatus: 'Sent',
      }),
    );

    this.logger.log(`Booking ${savedBooking.bookingNo} created for user ${userId} and patient ${createBookingDto.patientId}`);
    // Send Email to User
    try {
      const user = await this.bookingRepo.manager.query(`SELECT email FROM "user" WHERE id = $1`, [userId]);
      if (user && user[0] && user[0].email) {
        await this.mailerService.sendMail({
          to: user[0].email,
          subject: `Booking Confirmed - ${savedBooking.bookingNo}`,
          text: `Dear Patient,\n\nYour booking ${savedBooking.bookingNo} has been successfully created and is currently pending confirmation. We will notify you once a doctor is assigned.\n\nThank you,\nInHouse Doctor Team`
        });
      }
    } catch (e) {
      this.logger.error('Failed to send booking confirmation email', e);
    }

    return savedBooking;
  }

  async findMyBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { user: { id: userId } },
      relations: { doctor: true, patient: true },
      order: { createdDate: 'DESC' },
    });
  }

  async findAllBookings(): Promise<Booking[]> {
    return this.bookingRepo.find({
      relations: { doctor: true, patient: true },
      order: { createdDate: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string, remarks?: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { patient: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const oldStatus = booking.status;

    // Send Email to User on Status Update
    try {
      const user = await this.bookingRepo.manager.query(`
        SELECT u.email FROM "user" u 
        JOIN booking b ON b."userId" = u.id 
        WHERE b.id = $1
      `, [id]);
      if (user && user[0] && user[0].email) {
        await this.mailerService.sendMail({
          to: user[0].email,
          subject: `Booking Status Update - ${booking.bookingNo}`,
          text: `Dear Patient,\n\nThe status of your booking ${booking.bookingNo} has been updated to: ${status}.\n\nRemarks: ${remarks || 'None'}\n\nThank you,\nInHouse Doctor Team`
        });
      }
    } catch (e) {
      this.logger.error('Failed to send status update email', e);
    }

    booking.status = status;
    await this.bookingRepo.save(booking);

    // Log status history
    await this.historyRepo.save(
      this.historyRepo.create({ booking, oldStatus, newStatus: status, remarks }),
    );

    // Notify patient of status change
    await this.notificationRepo.save(
      this.notificationRepo.create({
        booking,
        user: booking.user ? { id: booking.user.id } as any : undefined,
        recipient: booking.patient?.id ?? id,
        notificationType: 'BookingStatusUpdate',
        message: `Your booking ${booking.bookingNo} status has been updated to ${status}.${remarks ? ' Remarks: ' + remarks : ''}`,
        deliveryStatus: 'Sent',
      }),
    );

    this.logger.log(`Booking ${id} status updated to ${status}`);
    return booking;
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, user: { id: userId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    
    return this.updateStatus(bookingId, 'Cancelled', 'Cancelled by user');
  }

  async rebook(userId: string, bookingId: string, newDate: string): Promise<Booking> {
    const originalBooking = await this.bookingRepo.findOne({
      where: { id: bookingId, user: { id: userId } },
      relations: { doctor: true, patient: true },
    });
    if (!originalBooking) throw new NotFoundException('Original booking not found');

    const newBookingDto: CreateBookingDto = {
      patientId: originalBooking.patient.id,
      scheduledDate: newDate,
      symptoms: originalBooking.symptoms,
      serviceId: originalBooking.serviceId,
      addressId: originalBooking.addressId,
    };
    
    return this.createBooking(userId, newBookingDto);
  }

  async uploadPrescription(bookingId: string, file: Express.Multer.File): Promise<Prescription> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const prescription = this.prescriptionRepo.create({
      booking,
      fileName: file.originalname,
      filePath: file.path.replace(/\\/g, '/'),
    });

    return this.prescriptionRepo.save(prescription);
  }

  async getPrescriptions(bookingId: string): Promise<Prescription[]> {
    return this.prescriptionRepo.find({
      where: { booking: { id: bookingId } },
      order: { uploadedDate: 'DESC' },
    });
  }
}
