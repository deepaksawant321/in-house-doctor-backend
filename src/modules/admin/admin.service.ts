import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
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
import { DoctorAssignment } from '../../entities/doctor-assignment.entity';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { EmailService } from '../../common/email/email.service';
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
    console.log('Login attempt for admin:', adminLoginDto.email);
    const admin = await this.adminRepo.findOne({
      where: { email: adminLoginDto.email },
    });
    console.log('Admin found in DB:', admin ? { id: admin.id, email: admin.email, isActive: admin.isActive, hash: admin.passwordHash } : null);
    if (!admin) {
      console.log('No admin found with email:', adminLoginDto.email);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!admin.isActive) {
      console.log('Admin is not active');
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(adminLoginDto.password, admin.passwordHash);
    console.log('Password match:', passwordMatch);
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

  // ─── Dashboard Stats ─────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [totalUsers, totalDoctors, totalBookings, pendingBookings, totalPayments] =
      await Promise.all([
        this.userRepo.count(),
        this.doctorRepo.count({ where: { status: 'Active' } }),
        this.bookingRepo.count(),
        this.bookingRepo.count({ where: { status: 'Pending' } }),
        this.paymentRepo.count({ where: { status: 'Success' } }),
      ]);

    return {
      success: true,
      data: { totalUsers, totalDoctors, totalBookings, pendingBookings, completedPayments: totalPayments },
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

    const bookings = await this.bookingRepo.find();
    const payments = await this.paymentRepo.find({ where: { status: 'Success' } });

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
    const doctorUtilization = doctors.map(doc => {
      const docBookings = bookings.filter(b => b.doctor && b.doctor.id === doc.id);
      return { name: doc.name.split(' ')[0], utilization: docBookings.length };
    }).sort((a, b) => b.utilization - a.utilization).slice(0, 5); // Top 5 active doctors

    return {
      success: true,
      data: { revenueData, bookingsTrend, doctorUtilization },
    };
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  async getAllUsers() {
    const users = await this.userRepo.find({ order: { createdDate: 'DESC' } });
    return { success: true, data: users };
  }

  // ─── Doctors ─────────────────────────────────────────────────────────────────

  async getAllDoctors(status?: string) {
    const where: FindOptionsWhere<Doctor> = {};
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

  async getAllBookings(status?: string, startDate?: string, endDate?: string) {
    const where: FindOptionsWhere<Booking> = {};
    if (status && status !== 'All') where.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdDate = Between(start, end);
    }

    const bookings = await this.bookingRepo.find({
      where,
      relations: { patient: true, doctor: true },
      order: { createdDate: 'DESC' },
    });
    return { success: true, data: bookings };
  }

  async updateBookingStatus(bookingId: string, status: string, adminId: string, remarks?: string) {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const oldStatus = booking.status;
    booking.status = status;
    await this.bookingRepo.save(booking);

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

  async getAllPayments(status?: string, startDate?: string, endDate?: string) {
    const where: FindOptionsWhere<Payment> = {};
    if (status && status !== 'All') where.status = status;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      // Filter by verifiedDate instead since createdDate does not exist
      where.verifiedDate = Between(start, end);
    }

    const payments = await this.paymentRepo.find({
      where,
      relations: { booking: { patient: true } },
      order: { verifiedDate: 'DESC' },
    });
    return { success: true, data: payments };
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
    await this.paymentRepo.save(payment);

    if (status === 'Success') {
      const booking = await this.bookingRepo.findOne({ where: { id: payment.booking.id } });
      if (booking) {
        booking.status = 'PaymentVerified';
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
        supportEmail: 'support@inhousedoctor.com',
        supportPhone: '1800-123-4567',
        whatsappNumber: '+91 9876543210',
        primaryUpiId: 'pay.inhousedoctor@upi',
      });
      await this.settingRepo.save(setting);
    } else if (!setting.companyName) {
      // Populate defaults if an empty record was created previously
      setting.companyName = 'InHouse Doctor';
      setting.supportEmail = 'support@inhousedoctor.com';
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
        const scheduledDateStr = new Date(booking.scheduledDate).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
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
