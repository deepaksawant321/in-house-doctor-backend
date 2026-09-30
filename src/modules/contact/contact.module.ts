import { Module } from '@nestjs/common';
import { EmailModule } from '../../common/email/email.module';
import { ContactController } from './contact.controller';

@Module({
  imports: [EmailModule],
  controllers: [ContactController],
})
export class ContactModule {}
