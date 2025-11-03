import { Module } from '@nestjs/common';
import { FireStoreModule } from 'src/common/database/firestore.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [FireStoreModule, NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
