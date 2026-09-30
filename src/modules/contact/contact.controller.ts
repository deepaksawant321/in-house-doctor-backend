import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService, esc } from '../../common/email/email.service';
import { CreateContactDto } from './dto/create-contact.dto';

/** Public "contact us" form: forwards the message to the admin mailbox. */
@ApiTags('Contact')
@Controller('api/contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the InHouse Doctor team' })
  async send(@Body() dto: CreateContactDto) {
    if (!dto.mobile && !dto.email) {
      throw new BadRequestException('Please provide a mobile number or an email address so we can reply');
    }
    const delivered = await this.emailService.sendAdminAlert(
      `Website contact message from ${dto.name}`,
      `<table class="info-table">
        <tr><td>Name</td><td>${esc(dto.name)}</td></tr>
        <tr><td>Mobile</td><td>${esc(dto.mobile || '—')}</td></tr>
        <tr><td>Email</td><td>${esc(dto.email || '—')}</td></tr>
        <tr><td>Message</td><td>${esc(dto.message).replace(/\n/g, '<br/>')}</td></tr>
      </table>`,
    );
    if (!delivered) {
      throw new ServiceUnavailableException('We could not send your message right now. Please call us instead.');
    }
    return { success: true, message: 'Thanks! Your message has been sent. We will get back to you shortly.' };
  }
}
