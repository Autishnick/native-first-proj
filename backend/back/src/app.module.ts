import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TasksModule } from 'src/tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chats/chat.module';
import { AuthModule } from './common/auth/auth.module';
import { FireStoreModule } from './common/database/firestore.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    FireStoreModule,

    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    CategoriesModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
