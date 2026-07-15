import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('StaticPages')
export class StaticPage extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'PageId' })
  id: number;

  @Column({ name: 'Title', type: 'nvarchar', length: 255 })
  title: string;

  @Column({ name: 'Slug', type: 'nvarchar', length: 255, unique: true })
  slug: string;

  @Column({ name: 'HtmlContent', type: 'nvarchar', length: 'MAX' })
  htmlContent: string;

  @Column({ name: 'SeoTitle', type: 'nvarchar', length: 255, nullable: true })
  seoTitle: string;

  @Column({ name: 'SeoDescription', type: 'nvarchar', length: 500, nullable: true })
  seoDescription: string;

  @Column({ name: 'IsPublished', type: 'bit', default: true })
  isPublished: boolean;
}
