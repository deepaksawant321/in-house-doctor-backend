import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column('text')
  quote: string;

  @Column('float', { default: 5.0 })
  rating: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdDate: Date;
}
