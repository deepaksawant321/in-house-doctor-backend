import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In, IsNull, MoreThanOrEqual } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminUser } from '../../entities/admin-user.entity';
import { User } from '../../entities/user.entity';
import { Doctor } from '../../entities/doctor.entity';
import { Booking } from '../../entities/booking.entity';
import { Payment } from '../../entities/payment.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Setting } from '../../entities/setting.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminForgotPasswordDto, AdminResetPasswordDto } from './dto/admin-forgot-password.dto';
import { OtpService } from '../otp/otp.service';
import { DoctorAssignment } from '../../entities/doctor-assignment.entity';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { parsePaging } from '../../common/utils/pagination';
import { parseDateRange } from '../../common/utils/date-range';
import { EmailService } from '../../common/email/email.service';
import { UserAddress } from '../../entities/user-address.entity';
import { Service } from '../../entities/service.entity';
import { BookingStatusHistory } from '../../entities/booking-status-history.entity';
import { VALID_BOOKING_STATUSES } from '../bookings/bookings.service';
import { formatDateTimeDMY } from '../../common/utils/date-format';

const TERMINAL_BOOKING_STATUSES = ['Cancelled', 'Completed'];
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminRepo: Repository<AdminUser>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
    @InjectRepository(DoctorAssignment)
    private assignmentRepo: Repository<DoctorAssignment>,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async audit(params: {
    adminId: string;
    actionName: string;
    entityName: string;
    entityId?: string;
    oldData?: object;
    newData?: object;
  }) {
    await this.auditLogRepo.save(
      this.auditLogRepo.create({
        userType: 'Admin',
        userId: params.adminId,
        actionName: params.actionName,
        entityName: params.entityName,
        entityId: params.entityId,
        oldData: params.oldData ? JSON.stringify(params.oldData) : undefined,
        newData: params.newData ? JSON.stringify(params.newData) : undefined,
      }),
    );
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────

  async login(adminLoginDto: AdminLoginDto, jwtService: JwtService) {
    const admin = await this.adminRepo.findOne({
      where: { email: adminLoginDto.email },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(adminLoginDto.password, admin.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, email: admin.email, role: admin.roleName };
    const accessToken = jwtService.sign(payload);

    // Audit login
    await this.audit({ adminId: admin.id, actionName: 'AdminLogin', entityName: 'AdminUsers', entityId: admin.id });

    return {
      success: true,
      message: 'Admin login successful',
      data: { accessToken, admin: { id: admin.id, fullName: admin.fullName, role: admin.roleName } },
    };
  }

  private static readonly RESET_PURPOSE = 'ADMIN_PWD_RESET';

  /** Sends a reset OTP if the admin exists. Always returns the same response so emails can't be enumerated. */
  async forgotPassword(dto: AdminForgotPasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (admin && admin.isActive) {
      await this.otpService.generateOtp(admin.email, 'EMAIL', AdminService.RESET_PURPOSE);
    }
    return { success: true, message: 'If this email belongs to an admin account, a verification code has been sent.' };
  }

  async resetPassword(dto: AdminResetPasswordDto) {
    const admin = await this.adminRepo.findOne({ where: { email: dto.email } });
    if (!admin || !admin.isActive) throw new BadRequestException('Invalid or expired OTP');

    await this.otpService.verifyOtp(admin.email, dto.otp, AdminService.RESET_PURPOSE);

    admin.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.adminRepo.save(admin);
    await this.audit({ adminId: admin.id, actionName: 'AdminPasswordReset', entityName: 'AdminUsers', entityId: admin.id });

    return { success: true, message: 'Password reset successful. You can now sign in.' };
  }

  // ─── Dashboard Stats ─────────────────────────────────────────────────────────

  async getDashboardStats(startDate?: string, endDate?: string) {
    // Optional inclusive date range; every card (bookings, users, active doctors, payments, visits) is scoped to it.
    const range = parseDateRange(startDate, endDate);
    const created = range ? { createdDate: range } : {};

    const [totalUsers, totalDoctors, totalBookings, pendingBookings, totalPayments, completedVisits] =
      await Promise.all([
        this.userRepo.count({ where: created }),
        this.doctorRepo.count({ where: { status: 'Active', ...created } }),
        this.bookingRepo.count({ where: created }),
        this.bookingRepo.count({ where: { status: 'Pending', ...created } }),
        this.paymentRepo.count({ where: { status: 'Success', ...(range ? { booking: { createdDate: range } } : {}) } }),
        this.bookingRepo.count({ where: { status: In(['Completed', 'VisitCompleted']), ...created } }),
      ]);

    return {
      success: true,
      // `range` echoes the filter that was applied so the UI can tell a stale backend (which ignores it) from a real result
      data: { totalUsers, totalDoctors, totalBookings, pendingBookings, completedPayments: totalPayments, completedVisits, range: { startDate: startDate || null, endDate: endDate || null } },
    };
  }

  async getDashboardTrends() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    // Only the last 7 days are needed — don't load the whole tables
    const windowStart = last7Days[0];
    const bookings = await this.bookingRepo.find({ where: { createdDate: MoreThanOrEqual(windowStart) } });
    // Payments without a verifiedDate (auto-confirmed) are counted as today, as before
    const payments = await this.paymentRepo.find({
      where: [
        { status: 'Success', verifiedDate: MoreThanOrEqual(windowStart) },
        { status: 'Success', verifiedDate: IsNull() },
      ],
    });

    const bookingsTrend = last7Days.map((date) => {
      const count = bookings.filter((b) => {
        if (!b.createdDate) return false;
        const d = new Date(b.createdDate);
        return d.toDateString() === date.toDateString();
      }).length;
      return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), bookings: count };
    });

    const revenueData = last7Days.map((date) => {
      const dailyPayments = payments.filter((p) => {
        const d = new Date(p.verifiedDate || new Date());
        return d.toDateString() === date.toDateString();
      });
      const revenue = dailyPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      return { name: date.toLocaleDateString('en-US', { weekday: 'short' }), revenue };
    });

    const doctors = await this.doctorRepo.find({ where: { status: 'Active' } });
    const doctorUtilization = (
      await Promise.all(
        doctors.map(async (doc) => ({
          name: (doc.name || '').split(' ')[0],
          utilization: await this.bookingRepo.count({ where: { doctor: { id: doc.id } } }),
        })),
      )
    ).sort((a, b) => b.utilization - a.utilization).slice(0, 5); // Top 5 active doctors

    return {
      success: true,
      data: { revenueData, bookingsTrend, doctorUtilization },
    };
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async getAllUsers(page?: string, pageSize?: string, startDate?: string, endDate?: string) {
    const paging = parsePaging(page, pageSize);
    const range = parseDateRange(startDate, endDate);
    const [users, total] = await this.userRepo.findAndCount({ where: range ? { createdDate: range } : {}, order: { createdDate: 'DESC' }, skip: paging.skip, take: paging.take });
    return { success: true, data: users, total, page: paging.page, pageSize: paging.pageSize };
  }

  // ─── Doctors ─────────────────────────────────────────────────────────────────

  async getAllDoctors(status?: string, startDate?: string, endDate?: string) {
    const where: FindOptionsWhere<Doctor> = {};
    const range = parseDateRange(startDate, endDate);
    if (range) where.createdDate = range;
    if (status && status !== 'All') {
      where.status = status;
    }
    const doctors = await this.doctorRepo.find({ where, order: { createdDate: 'DESC' } });
    return { success: true, data: doctors };
  }

  async toggleDoctorStatus(doctorId: string, adminId: string) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const oldStatus = doctor.status;
    doctor.status = doctor.status === 'Active' ? 'Inactive' : 'Active';
    await this.doctorRepo.save(doctor);

    await this.audit({
      adminId,
      actionName: 'ToggleDoctorStatus',
      entityName: 'Doctors',
      entityId: doctorId,
      oldData: { status: oldStatus },
      newData: { status: doctor.status },
    });

    return { success: true, message: `Doctor status changed to ${doctor.status}`, data: doctor };
  }

  // ─── Bookings ────────────────────────────────────────────────────────────────

  async getAllBookings(status?: string, startDate?: string, endDate?: string, page?: string, pageSize?: string) {
    const paging = parsePaging(page, pageSize);
    const where: FindOptionsWhere<Booking> = {};
    if (status && status !== 'All') {
      // Comma-separated list (e.g. 'Completed,VisitCompleted') matches any of them, mirroring the dashboard counts
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      where.status = statuses.length > 1 ? In(statuses) : statuses[0];
    }
    const range = parseDateRange(startDate, endDate);
    if (range) where.createdDate = range;

    const [bookings, total] = await this.bookingRepo.findAndCount({
      where,
      relations: { patient: true, doctor: true },
      order: { createdDate: 'DESC', id: 'DESC' },
      skip: paging.skip,
      take: paging.take,
    });
    return { success: true, data: bookings, total, page: paging.page, pageSize: paging.pageSize };
  }

  async getDoctorById(id: string) {
    if (!/^[0-9]{1,18}$/.test(id)) throw new BadRequestException('Invalid doctor id');
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return { success: true, data: doctor };
  }

  async getBookingDetail(id: string) {
    if (!/^[0-9]{1,18}$/.test(id)) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: { patient: true, doctor: true, user: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const manager = this.bookingRepo.manager;
    const [payment, address, service, history] = await Promise.all([
      this.paymentRepo.findOne({ where: { booking: { id } } }),
      booking.addressId ? manager.findOne(UserAddress, { where: { id: booking.addressId } }) : Promise.resolve(null),
      booking.serviceId ? manager.findOne(Service, { where: { id: booking.serviceId } }) : Promise.resolve(null),
      manager.find(BookingStatusHistory, { where: { booking: { id } } as any, order: { changedDate: 'DESC' } as any }),
    ]);

    return {
      success: true,
      data: {
        ...booking,
        user: booking.user ? { id: booking.user.id, fullName: booking.user.fullName, email: booking.user.email, phoneNumber: booking.user.phoneNumber } : null,
        payment,
        address,
        service,
        history,
      },
    };
  }

  async updateBookingStatus(bookingId: string, status: string, adminId: string, remarks?: string) {
    if (!VALID_BOOKING_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed: ${VALID_BOOKING_STATUSES.join(', ')}`);
    }
    if (!/^[0-9]{1,18}$/.test(String(bookingId))) throw new BadRequestException('Invalid booking id');
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const oldStatus = booking.status;
    if (oldStatus === status) throw new BadRequestException(`Booking is already ${status}`);
    if (TERMINAL_BOOKING_STATUSES.includes(oldStatus)) {
      throw new BadRequestException(`A ${oldStatus} booking can no longer change status`);
    }
    booking.status = status;
    await this.bookingRepo.save(booking);
    await this.bookingRepo.manager.save(
      BookingStatusHistory,
      this.bookingRepo.manager.create(BookingStatusHistory, {
        booking: { id: bookingId } as any,
        oldStatus,
        newStatus: status,
        remarks,
        changedBy: adminId,
      }),
    );

    await this.audit({
      adminId,
      actionName: 'UpdateBookingStatus',
      entityName: 'Bookings',
      entityId: bookingId,
      oldData: { status: oldStatus },
      newData: { status, remarks },
    });

    this.logger.log(`Booking ${bookingId} status updated to ${status} by admin ${adminId}.`);

    // Email the user whose booking was updated (non-blocking)
    try {
      const bookingWithUser = await this.bookingRepo.findOne({
        where: { id: bookingId },
        relations: { user: true }
      });
      if (bookingWithUser?.user?.email) {
        await this.emailService.sendBookingStatusUpdate(bookingWithUser.user.email, booking.bookingNo, status, remarks);
      }
    } catch (e) {
      this.logger.error('Failed to send booking status email', e);
    }

    return { success: true, message: `Booking status updated to ${status}`, data: booking };
  }

  // ─── Payments ────────────────────────────────────────────────────────────────

  async getAllPayments(status?: string, startDate?: string, endDate?: string, page?: string, pageSize?: string) {
    const paging = parsePaging(page, pageSize);
    const where: FindOptionsWhere<Payment> = {};
    if (status && status !== 'All') where.status = status;
    // Payments have no creation date: scope by the booking's creation date, exactly like the dashboard's Payments Done card
    const range = parseDateRange(startDate, endDate);
    if (range) where.booking = { createdDate: range };

    const [payments, total] = await this.paymentRepo.findAndCount({
      where,
      relations: { booking: { patient: true } },
      skip: paging.skip,
      take: paging.take,
      // Newest first. (Ordering by verifiedDate pushed unverified payments — the ones awaiting action — to the end.)
      order: { id: 'DESC' },
    });
    return { success: true, data: payments, total, page: paging.page, pageSize: paging.pageSize };
  }

  async verifyPayment(paymentId: string, status: string, adminId: string, remarks?: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: { booking: true } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === 'Success') {
      throw new BadRequestException('Payment is already verified as Success.');
    }

    const oldStatus = payment.status;
    payment.status = status;
    payment.remarks = remarks ?? payment.remarks;
    payment.verifiedDate = new Date();
    payment.verifiedBy = adminId;
    await this.paymentRepo.save(payment);
    if (payment.booking?.id) await this.bookingRepo.update(payment.booking.id, { paymentStatus: status });

    if (status === 'Success') {
      const booking = await this.bookingRepo.findOne({ where: { id: payment.booking.id } });
      if (booking) {
        booking.status = 'PaymentVerified';
        booking.paymentStatus = status;
        await this.bookingRepo.save(booking);
        // We could log status history here, but it's simpler to just update the status
      }
    }

    await this.audit({
      adminId,
      actionName: 'VerifyPayment',
      entityName: 'Payments',
      entityId: paymentId,
      oldData: { status: oldStatus },
      newData: { status, remarks },
    });

    this.logger.log(`Payment ${paymentId} verified as ${status} by admin ${adminId}.`);

    // Email the user whose payment was verified (non-blocking)
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

    return { success: true, message: `Payment marked as ${status}`, data: payment };
  }

  // ─── Settings ────────────────────────────────────────────────────────────────

  async getSettings() {
    let setting = await this.settingRepo.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepo.create({
        companyName: 'InHouse Doctor',
        supportEmail: 'support@doctordoorstep.com',
        supportPhone: '1800-123-4567',
        whatsappNumber: '+91 9876543210',
        primaryUpiId: 'pay.inhousedoctor@upi',
      });
      await this.settingRepo.save(setting);
    } else if (!setting.companyName) {
      // Populate defaults if an empty record was created previously
      setting.companyName = 'InHouse Doctor';
      setting.supportEmail = 'support@doctordoorstep.com';
      setting.supportPhone = '1800-123-4567';
      setting.whatsappNumber = '+91 9876543210';
      setting.primaryUpiId = 'pay.inhousedoctor@upi';
      await this.settingRepo.save(setting);
    }
    return { success: true, data: setting };
  }

  async updateSettings(data: any, adminId: string) {
    let setting = await this.settingRepo.findOne({ where: {} });
    if (!setting) {
      setting = this.settingRepo.create({});
    }

    const oldData = { ...setting };
    Object.assign(setting, data);
    await this.settingRepo.save(setting);

    await this.audit({
      adminId,
      actionName: 'UpdateSettings',
      entityName: 'Settings',
      entityId: setting.id?.toString(),
      oldData,
      newData: setting,
    });

    return { success: true, message: 'Settings updated successfully', data: setting };
  }

  // ─── Assignments ─────────────────────────────────────────────────────────────

  async assignDoctor(assignDoctorDto: AssignDoctorDto, assignedBy: string): Promise<DoctorAssignment> {
    const booking = await this.bookingRepo.findOne({ where: { id: assignDoctorDto.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const doctor = await this.doctorRepo.findOne({
      where: { id: assignDoctorDto.doctorId, status: 'Active' },
    });
    if (!doctor) throw new NotFoundException('Doctor not found or inactive');

    const existingAssignment = await this.assignmentRepo.findOne({
      where: { booking: { id: booking.id }, status: 'Active' },
    });
    if (existingAssignment) {
      throw new BadRequestException('A doctor is already assigned to this booking. Revoke first.');
    }

    const assignment = this.assignmentRepo.create({
      booking,
      doctor,
      assignedBy,
      status: 'Active',
    });

    const saved = await this.assignmentRepo.save(assignment);

    booking.doctor = doctor;
    booking.status = 'DoctorAssigned';
    await this.bookingRepo.save(booking);

    this.logger.log(`Doctor ${doctor.id} assigned to booking ${booking.id}`);

    // Email the user about doctor assignment (non-blocking)
    try {
      const bookingWithUser = await this.bookingRepo.findOne({
        where: { id: booking.id },
        relations: { user: true }
      });
      if (bookingWithUser?.user?.email) {
        const scheduledDateStr = formatDateTimeDMY(booking.scheduledDate);
        await this.emailService.sendDoctorAssigned(
          bookingWithUser.user.email,
          booking.bookingNo,
          doctor.name,
          scheduledDateStr,
        );
      }
    } catch (e) {
      this.logger.error('Failed to send doctor assignment email', e);
    }

    return saved;
  }

  async getAssignmentsByBooking(bookingId: string): Promise<DoctorAssignment[]> {
    return this.assignmentRepo.find({
      where: { booking: { id: bookingId } },
      relations: { doctor: true },
      order: { assignedDate: 'DESC' },
    });
  }

  async getAllAssignments(): Promise<DoctorAssignment[]> {
    return this.assignmentRepo.find({
      relations: { booking: true, doctor: true },
      order: { assignedDate: 'DESC' },
    });
  }

  async revokeAssignment(assignmentId: string): Promise<DoctorAssignment> {
    const assignment = await this.assignmentRepo.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.booking', 'booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('assignment.id = :id', { id: assignmentId })
      .orWhere('booking.id = :id AND assignment.status = :status', { id: assignmentId, status: 'Active' })
      .getOne();
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = 'Revoked';
    await this.assignmentRepo.save(assignment);

    const booking = await this.bookingRepo.findOne({ where: { id: assignment.booking.id } });
    if (booking) {
      booking.status = 'PaymentVerified';
      await this.bookingRepo.save(booking);
    }

    // Email the user that doctor was revoked (non-blocking)
    try {
      if (assignment.booking?.user?.email && booking?.bookingNo) {
        await this.emailService.sendDoctorRevoked(assignment.booking.user.email, booking.bookingNo);
      }
    } catch (e) {
      this.logger.error('Failed to send doctor revocation email', e);
    }

    return assignment;
  }
}
