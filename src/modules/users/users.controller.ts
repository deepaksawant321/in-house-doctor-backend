import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('address')
  @ApiOperation({ summary: 'Add a new address to the logged-in user profile' })
  async addAddress(@Request() req: any, @Body() createUserAddressDto: CreateUserAddressDto) {
    return {
      success: true,
      message: 'Address added successfully',
      data: await this.usersService.addAddress(req.user.sub, createUserAddressDto),
    };
  }

  @Get('address')
  @ApiOperation({ summary: 'Get all addresses for the logged-in user' })
  async getAddresses(@Request() req: any) {
    return {
      success: true,
      data: await this.usersService.getAddresses(req.user.sub),
    };
  }
}
