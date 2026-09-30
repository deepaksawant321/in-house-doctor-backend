import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingStatusHistory } from '../../entities/booking-status-history.entity';
import { Prescription } from '../../entities/prescription.entity';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { EmailService } from '../../common/email/email.service';
import { Patient } from '../../entities/patient.entity';
import { UserAddress } from '../../entities/user-address.entity';
import { parsePaging } from '../../common/utils/pagination';
import { isAdminUser } from '../../common/utils/roles';

export const VALID_BOOKING_STATUSES = [
  'Created', 'Pending', 'Confirmed', 'PaymentPending', 'PaymentVerified', 'DoctorAssigned',
  'DoctorConfirmed', 'VisitStarted', 'VisitCompleted', 'Completed', 'Cancelled',
];

const NUMERIC_ID = /^\d{1,18}$/;

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
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const scheduledDateObj = new Date(createBookingDto.scheduledDate);
    if (isNaN(scheduledDateObj.getTime())) {
      throw new BadRequestException('Scheduled date is invalid');
    }
    if (scheduledDateObj < new Date()) {
      throw new BadRequestException('Scheduled date cannot be in the past');
    }

    // The patient (and address, if given) must belong to the authenticated user
    if (!NUMERIC_ID.test(createBookingDto.patientId)) {
      throw new BadRequestException('Invalid patientId');
    }
    const patientRecord = await this.bookingRepo.manager.findOne(Patient, {
      where: { id: createBookingDto.patientId, user: { id: userId } } as any,
    });
    if (!patientRecord) throw new NotFoundException('Patient not found');

    if (createBookingDto.addressId) {
      if (!NUMERIC_ID.test(createBookingDto.addressId)) {
        throw new BadRequestException('Invalid addressId');
      }
      const addressRecord = await this.bookingRepo.manager.findOne(UserAddress, {
        where: { id: createBookingDto.addressId, user: { id: userId } } as any,
      });
      if (!addressRecord) throw new NotFoundException('Address not found');
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
      preferredTime: createBookingDto.preferredTime,
      serviceId: createBookingDto.serviceId,
      addressId: createBookingDto.addressId,
      status: 'Pending',
      paymentStatus: 'Pending',
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

    // Send in-app notification
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

    this.logger.log(`Booking ${savedBooking.bookingNo} created for user ${userId}`);

    // Send Email to User + Admin (non-blocking)
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });

      const patientName = patientRecord.fullName || 'Patient';
      const scheduledDateStr = new Date(createBookingDto.scheduledDate).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

      if (user?.email) {
        await this.emailService.sendBookingConfirmation(user.email, {
          bookingNo: savedBooking.bookingNo,
          patientName,
          service: createBookingDto.serviceId ? String(createBookingDto.serviceId) : '—',
          scheduledDate: scheduledDateStr,
          address: createBookingDto.addressId ? String(createBookingDto.addressId) : '—',
        });
      }

      await this.emailService.sendAdminNewBooking(
        savedBooking.bookingNo,
        patientName,
        createBookingDto.serviceId ? String(createBookingDto.serviceId) : '—',
        scheduledDateStr,
      );
    } catch (e) {
      this.logger.error('Failed to send booking emails', e);
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

  async findAllBookings(page?: string, pageSize?: string) {
    const paging = parsePaging(page, pageSize);
    const [data, total] = await this.bookingRepo.findAndCount({
      relations: { doctor: true, patient: true },
      order: { createdDate: 'DESC', id: 'DESC' },
      skip: paging.skip,
      take: paging.take,
    });
    return { data, total, page: paging.page, pageSize: paging.pageSize };
  }

  async updateStatus(id: string, status: string, remarks?: string): Promise<Booking> {
    if (!VALID_BOOKING_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${VALID_BOOKING_STATUSES.join(', ')}`);
    }
    if (!NUMERIC_ID.test(id)) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { patient: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const oldStatus = booking.status;
    booking.status = status;
    await this.bookingRepo.save(booking);

    // Log status history
    await this.historyRepo.save(
      this.historyRepo.create({ booking, oldStatus, newStatus: status, remarks }),
    );

    // In-app notification
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

    // Email User (non-blocking)
    try {
      const user = booking.user
        ? await this.userRepo.findOne({ where: { id: booking.user.id } })
        : null;
      if (user?.email) {
        await this.emailService.sendBookingStatusUpdate(user.email, booking.bookingNo, status, remarks);
      }
    } catch (e) {
      this.logger.error('Failed to send status update email', e);
    }

    this.logger.log(`Booking ${id} status updated to ${status}`);
    return booking;
  }

  async cancelBooking(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId, user: { id: userId } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (['Cancelled', 'Completed', 'VisitCompleted'].includes(booking.status)) {
      throw new BadRequestException(`A booking that is ${booking.status} cannot be cancelled`);
    }

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
      preferredTime: originalBooking.preferredTime,
      serviceId: originalBooking.serviceId,
      addressId: originalBooking.addressId,
    };

    return this.createBooking(userId, newBookingDto);
  }

  private async assertBookingAccess(user: { id: string; role?: string }, bookingId: string): Promise<Booking> {
    if (!NUMERIC_ID.test(bookingId)) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId }, relations: { user: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!isAdminUser(user) && booking.user?.id !== user.id) {
      throw new ForbiddenException('You do not have access to this booking');
    }
    return booking;
  }

  async uploadPrescription(user: { id: string; role?: string }, bookingId: string, file: Express.Multer.File): Promise<Prescription> {
    if (!file) throw new BadRequestException('A file is required');
    const booking = await this.assertBookingAccess(user, bookingId);

    const prescription = this.prescriptionRepo.create({
      booking,
      fileName: file.originalname,
      filePath: file.path.replace(/\\/g, '/'),
    });

    return this.prescriptionRepo.save(prescription);
  }

  async getPrescriptions(user: { id: string; role?: string }, bookingId: string): Promise<Prescription[]> {
    await this.assertBookingAccess(user, bookingId);
    return this.prescriptionRepo.find({
      where: { booking: { id: bookingId } },
      order: { uploadedDate: 'DESC' },
    });
  }
}
