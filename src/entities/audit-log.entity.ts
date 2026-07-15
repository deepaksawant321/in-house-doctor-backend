import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('AuditLogs')
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'LogId', type: 'bigint' })
  id: string;

  @Column({ name: 'UserType', type: 'varchar', length: 50, nullable: true })
  userType: string;

  @Column({ name: 'UserId', type: 'bigint', nullable: true })
  userId: string;

  @Column({ name: 'ActionName', type: 'nvarchar', length: 200, nullable: true })
  actionName: string;

  @Column({ name: 'EntityName', type: 'nvarchar', length: 200, nullable: true })
  entityName: string;

  @Column({ name: 'EntityId', type: 'bigint', nullable: true })
  entityId: string;

  @Column({ name: 'OldData', type: 'nvarchar', length: 'MAX', nullable: true })
  oldData: string;

  @Column({ name: 'NewData', type: 'nvarchar', length: 'MAX', nullable: true })
  newData: string;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate: Date;
}
