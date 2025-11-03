// Per your request, all code and comments are in English.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TasksModule } from 'tasks/tasks.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './common/auth/auth.module';
import { FireStoreModule } from './common/database/firestore.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // For .env variables

    // Database
    FireStoreModule,

    // App Features
    AuthModule,
    UsersModule,
    TasksModule,
    NotificationsModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
