import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { FireStoreService } from 'src/common/database/firestore.service';
import { UserProfile } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(
  BearerStrategy,
  'firebase',
) {
  constructor(
    private readonly firebaseService: FireStoreService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async validate(token: string): Promise<UserProfile> {
    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      const uid = decodedToken.uid;

      const userProfile = await this.usersService.findOne(uid);

      return userProfile;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired token. Please log in again.',
      );
    }
  }
}
