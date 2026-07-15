import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserAddress } from '../../entities/user-address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private addressRepository: Repository<UserAddress>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<UserAddress> {
    const address = this.addressRepository.create({
      ...createAddressDto,
      user: { id: userId },
    });
    
    if (address.isDefault) {
      await this.unsetOtherDefaults(userId);
    }
    
    return this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<UserAddress[]> {
    return this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdDate: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<UserAddress> {
    const address = await this.addressRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID "${id}" not found`);
    }
    return address;
  }

  async update(userId: string, id: string, updateAddressDto: UpdateAddressDto): Promise<UserAddress> {
    const address = await this.findOne(userId, id);
    
    if (updateAddressDto.isDefault && !address.isDefault) {
      await this.unsetOtherDefaults(userId);
    }
    
    Object.assign(address, updateAddressDto);
    return this.addressRepository.save(address);
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.findOne(userId, id);
    await this.addressRepository.remove(address);
  }

  async setDefault(userId: string, id: string): Promise<UserAddress> {
    const address = await this.findOne(userId, id);
    await this.unsetOtherDefaults(userId);
    address.isDefault = true;
    return this.addressRepository.save(address);
  }
  
  private async unsetOtherDefaults(userId: string): Promise<void> {
    await this.addressRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false }
    );
  }
}
