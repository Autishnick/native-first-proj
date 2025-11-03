import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/mark-as-read.dto';
import { NotificationsService } from './notifications.service';

import { User } from 'src/common/auth/decorators/user.decorator';
import { FirebaseAuthGuard } from 'src/common/auth/guards/firebase-auth.guard';
import type { UserProfile } from 'src/users/entities/user.entity';

@UseGuards(FirebaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAllForCurrentUser(@User() user: UserProfile) {
    return this.notificationsService.findAllByRecipient(user.uid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @User() user: UserProfile,
  ) {
    return this.notificationsService.update(
      id,
      updateNotificationDto,
      user.uid,
    );
  }
}
