import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('RefreshTokens')
export class RefreshToken {
  @PrimaryGeneratedColumn({ name: 'RefreshTokenId', type: 'bigint' })
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'Token', type: 'nvarchar', length: 'MAX', nullable: true })
  token: string;

  @Column({ name: 'ExpiryDate', type: 'datetime', nullable: true })
  expiryDate: Date;

  @Column({ name: 'IsRevoked', type: 'bit', default: false, nullable: true })
  isRevoked: boolean;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
