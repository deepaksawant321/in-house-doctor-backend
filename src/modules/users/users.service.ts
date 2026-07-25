import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserAddress } from '../../entities/user-address.entity';
import { CreateUserAddressDto } from './dto/create-user-address.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(UserAddress)
    private addressRepo: Repository<UserAddress>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findByPhone(phoneNumber: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { phoneNumber } });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.email) {
      const existingEmail = await this.findByEmail(userData.email);
      if (existingEmail) throw new BadRequestException('Email already in use');
    }

    if (userData.phoneNumber) {
      const existingPhone = await this.findByPhone(userData.phoneNumber);
      if (existingPhone) throw new BadRequestException('Phone number already in use');
    }

    const user = this.usersRepo.create(userData);
    return this.usersRepo.save(user);
  }

  async activateUser(phoneNumber: string): Promise<void> {
    const user = await this.findByPhone(phoneNumber);
    if (user) {
      user.isVerified = true;
      await this.usersRepo.save(user);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    Object.assign(user, updateData);
    return this.usersRepo.save(user);
  }

  // ─── Addresses ───────────────────────────────────────────────────────────────

  async getAddresses(userId: string): Promise<UserAddress[]> {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { createdDate: 'DESC' },
    });
  }

  async addAddress(userId: string, dto: CreateUserAddressDto): Promise<UserAddress> {
    const address = this.addressRepo.create({
      user: { id: userId } as any,
      ...dto,
    });
    return this.addressRepo.save(address);
  }
}
