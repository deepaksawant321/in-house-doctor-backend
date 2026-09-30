import { Controller, Get, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('all')
  @Roles('Admin', 'SuperAdmin')
  @ApiOperation({ summary: 'Get all notifications (Admin)' })
  async getAll() {
    const data = await this.notificationsService.getAllNotifications();
    return { success: true, data };
  }

  @Get()
  @Roles('Patient')
  @ApiOperation({ summary: 'Get all notifications for the logged-in user' })
  async getMine(@Request() req: any) {
    const data = await this.notificationsService.getMyNotifications(req.user.id);
    return { success: true, data };
  }

  @Patch('read/:id')
  @Roles('Patient')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    await this.notificationsService.markAsRead(req.user.id, id);
    return { success: true, message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @Roles('Patient')
  @ApiOperation({ summary: 'Mark all notifications as read for the logged-in user' })
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true, message: 'All notifications marked as read' };
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get all notifications for a specific booking' })
  async getForBooking(@Request() req: any, @Param('bookingId') bookingId: string) {
    const data = await this.notificationsService.getNotificationsForBooking(req.user, bookingId);
    return { success: true, data };
  }
}
