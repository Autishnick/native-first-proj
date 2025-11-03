import { Test, TestingModule } from '@nestjs/testing';
import { FireStoreService } from './firestore.service';

describe('DatabaseService', () => {
  let service: FireStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FireStoreService],
    }).compile();

    service = module.get<FireStoreService>(FireStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
