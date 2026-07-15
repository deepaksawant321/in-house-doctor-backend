import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Services')
export class Service {
  @PrimaryGeneratedColumn({ name: 'ServiceId', type: 'int' })
  id: number;

  @Column({ name: 'ServiceName', type: 'nvarchar', length: 200, nullable: true })
  serviceName: string;

  @Column({ name: 'Description', type: 'nvarchar', length: 'MAX', nullable: true })
  description: string;

  @Column({ name: 'BasePrice', type: 'decimal', precision: 10, scale: 2, nullable: true })
  basePrice: number;

  @Column({ name: 'IsActive', type: 'bit', default: true, nullable: true })
  isActive: boolean;

  @Column({ name: 'Slug', type: 'nvarchar', length: 100, nullable: true })
  slug: string;

  @Column({ name: 'LongDescription', type: 'nvarchar', length: 'MAX', nullable: true })
  longDescription: string;

  @Column({ name: 'ImageUrl', type: 'nvarchar', length: 500, nullable: true })
  imageUrl: string;
}
