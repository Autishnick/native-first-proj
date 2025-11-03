import { Injectable, NotFoundException } from '@nestjs/common';
import { FireStoreService } from 'src/common/database/firestore.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfile } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly usersCollection;

  constructor(private readonly firebaseService: FireStoreService) {
    this.usersCollection = this.firebaseService.firestore.collection('users');
  }

  async create(createUserDto: CreateUserDto): Promise<UserProfile> {
    const { uid, ...userData } = createUserDto;

    if (!uid) {
      throw new Error('User UID is required to create a user document.');
    }

    await this.usersCollection.doc(uid).set(userData);

    return {
      uid,
      ...userData,
    } as UserProfile;
  }

  async findAll(): Promise<UserProfile[]> {
    const snapshot = await this.usersCollection.get();
    if (snapshot.empty) {
      return [];
    }

    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
    return users;
  }

  async findOne(uid: string): Promise<UserProfile> {
    const docRef = this.usersCollection.doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    return { uid: doc.id, ...doc.data() } as UserProfile;
  }

  async update(
    uid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfile> {
    const docRef = this.usersCollection.doc(uid);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    await docRef.update({ ...updateUserDto });

    const updatedDoc = await docRef.get();
    return { uid: updatedDoc.id, ...updatedDoc.data() } as UserProfile;
  }

  async remove(uid: string): Promise<{ message: string }> {
    const docRef = this.usersCollection.doc(uid);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    await docRef.delete();
    return { message: `User with UID ${uid} successfully deleted.` };
  }
}
