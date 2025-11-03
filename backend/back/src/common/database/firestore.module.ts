// Per your request, all code and comments are in English.
import { Global, Module } from '@nestjs/common'; // 1. Import Global
import { FireStoreService } from './firestore.service';

@Global() // 2. Add this decorator
@Module({
  providers: [FireStoreService],
  exports: [FireStoreService],
})
export class FireStoreModule {}
