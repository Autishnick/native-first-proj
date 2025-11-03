import { Module } from '@nestjs/common';
import { FireStoreModule } from 'src/common/database/firestore.module';
import { ProfileController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [FireStoreModule],
  controllers: [ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
