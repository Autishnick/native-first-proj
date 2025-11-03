// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { FireStoreModule } from 'src/common/database/firestore.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [FireStoreModule], // <-- Add here
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // <-- Export if TasksService needs to call it
})
export class NotificationsModule {}
