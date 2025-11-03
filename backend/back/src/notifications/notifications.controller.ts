// Per your request, all code and comments are in English.
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards, // 1. Import
} from '@nestjs/common';
import { UpdateNotificationDto } from './dto/mark-as-read.dto';
import { NotificationsService } from './notifications.service';

// --- Auth Imports ---
import { User } from 'src/common/auth/decorators/user.decorator'; // 3. Import Decorator
import { FirebaseAuthGuard } from 'src/common/auth/guards/firebase-auth.guard'; // 2. Import Guard
import type { UserProfile } from 'src/users/entities/user.entity'; // 4. Import User type

@UseGuards(FirebaseAuthGuard) // 5. Protect ALL routes
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get() // 6. Change route to GET /notifications
  findAllForCurrentUser(@User() user: UserProfile) {
    // 7. Get user from decorator, not from param
    return this.notificationsService.findAllByRecipient(user.uid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @User() user: UserProfile, // 8. Get user from decorator for security
  ) {
    // Pass the user.uid to the service for the security check
    return this.notificationsService.update(
      id,
      updateNotificationDto,
      user.uid,
    );
  }
}
