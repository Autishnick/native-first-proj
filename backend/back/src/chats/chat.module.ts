import { Module } from '@nestjs/common';
import { AuthModule } from 'src/common/auth/auth.module';
import { FireStoreModule } from 'src/common/database/firestore.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users/users.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [FireStoreModule, AuthModule, NotificationsModule, UsersModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
