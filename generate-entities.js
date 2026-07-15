const fs = require('fs');
const path = require('path');

const entities = [
  'User', 'UserAddress', 'Service', 'Doctor', 'DoctorCoverageArea', 'Booking',
  'Prescription', 'Payment', 'DoctorAssignment', 'Notification', 'AdminUser',
  'Setting', 'AuditLog', 'OTPVerification', 'OTPLog', 'UserSession',
  'RefreshToken', 'BookingStatusHistory', 'DoctorAvailability'
];

const dir = path.join(__dirname, 'src', 'common', 'entities'); // Putting them in common/entities or should they be in their own modules? Let's put them in their respective modules or just in a root entities folder. Wait, the plan said "Generate TypeORM entities extending BaseEntity". I'll put them in 'src/entities' for now.
const entitiesDir = path.join(__dirname, 'src', 'entities');

if (!fs.existsSync(entitiesDir)){
    fs.mkdirSync(entitiesDir, { recursive: true });
}

entities.forEach(entity => {
  const fileName = entity.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '.entity.ts';
  const filePath = path.join(entitiesDir, fileName);
  
  const content = `import { Entity } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';

@Entity('${entity}s')
export class ${entity} extends BaseEntity {
  // TODO: Add specific columns from the existing database schema
}
`;

  fs.writeFileSync(filePath, content);
});
