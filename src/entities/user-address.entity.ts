import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('UserAddresses')
export class UserAddress {
  @PrimaryGeneratedColumn({ name: 'AddressId', type: 'bigint' })
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'AddressLine1', type: 'nvarchar', length: 500, nullable: true })
  addressLine1: string;

  @Column({ name: 'AddressLine2', type: 'nvarchar', length: 500, nullable: true })
  addressLine2: string;

  @Column({ name: 'Area', type: 'nvarchar', length: 200, nullable: true })
  area: string;

  @Column({ name: 'City', type: 'nvarchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'State', type: 'nvarchar', length: 100, nullable: true })
  state: string;

  @Column({ name: 'Pincode', type: 'varchar', length: 10, nullable: true })
  pincode: string;

  @Column({ name: 'Landmark', type: 'nvarchar', length: 200, nullable: true })
  landmark: string;

  @Column({ name: 'IsDefault', type: 'bit', default: false })
  isDefault: boolean;


  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
