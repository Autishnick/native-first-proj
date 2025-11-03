// src/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { FireStoreModule } from 'src/common/database/firestore.module'; // <-- Import FireStoreModule
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [FireStoreModule, NotificationsModule], // <-- Add here
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
