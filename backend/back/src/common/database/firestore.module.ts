import { Global, Module } from '@nestjs/common';
import { FireStoreService } from './firestore.service';

@Global()
@Module({
  providers: [FireStoreService],
  exports: [FireStoreService],
})
export class FireStoreModule {}
