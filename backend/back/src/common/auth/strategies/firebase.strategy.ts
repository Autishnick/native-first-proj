// Per your request, all code and comments are in English.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { FireStoreService } from 'src/common/database/firestore.service';
import { UserProfile } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(
  BearerStrategy,
  'firebase', // This is the name of the strategy
) {
  constructor(
    private readonly firebaseService: FireStoreService,
    private readonly usersService: UsersService, // Requires UsersService
  ) {
    super();
  }

  /**
   * This method validates the Bearer token.
   * Passport will call this for us.
   */
  async validate(token: string): Promise<UserProfile> {
    try {
      // 1. Verify the ID token using Firebase Admin
      // This now works because FireStoreService has .auth
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      const uid = decodedToken.uid;

      // 2. Fetch the user's profile from Firestore
      // This now works because UsersService has .getProfile
      const userProfile = await this.usersService.findOne(uid);

      // 3. Return the profile. Passport will attach this to req.user
      return userProfile;
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or expired token. Please log in again.',
      );
    }
  }
}
