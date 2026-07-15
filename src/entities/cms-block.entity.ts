import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

export enum CmsBlockType {
  HERO = 'Hero',
  SECTION = 'Section',
  BANNER = 'Banner',
}

@Entity('CmsBlocks')
export class CmsBlock extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'BlockId' })
  id: number;

  @Column({ name: 'Title', type: 'nvarchar', length: 255 })
  title: string;

  @Column({ name: 'BlockType', type: 'varchar', length: 50, default: CmsBlockType.SECTION })
  blockType: CmsBlockType;

  @Column({ name: 'Content', type: 'nvarchar', length: 'MAX', nullable: true })
  content: string;

  @Column({ name: 'ImageUrl', type: 'nvarchar', length: 500, nullable: true })
  imageUrl: string;

  @Column({ name: 'CallToActionText', type: 'nvarchar', length: 100, nullable: true })
  callToActionText: string;

  @Column({ name: 'CallToActionLink', type: 'nvarchar', length: 500, nullable: true })
  callToActionLink: string;

  @Column({ name: 'IsActive', type: 'bit', default: true })
  isActive: boolean;

  @Column({ name: 'SortOrder', type: 'int', default: 0 })
  sortOrder: number;
}
