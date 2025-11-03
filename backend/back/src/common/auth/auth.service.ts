import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FireStoreService } from '../database/firestore.service';
import { LoginDto, RegisterDto } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(
    private readonly fireStoreService: FireStoreService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, displayName, role } = registerDto;

      const userRecord = await this.fireStoreService.auth.createUser({
        email,
        password,
        displayName,
      });

      await this.fireStoreService.firestore
        .collection('users')
        .doc(userRecord.uid)
        .set({
          email,
          displayName,
          role,
          createdAt: this.fireStoreService.FieldValue.serverTimestamp(),
        });

      await this.fireStoreService.auth.setCustomUserClaims(userRecord.uid, {
        role,
      });

      const nestJsToken = await this.jwtService.signAsync({
        uid: userRecord.uid,
        role,
      });
      const firebaseToken = await this.fireStoreService.auth.createCustomToken(
        userRecord.uid,
      );

      return {
        success: true,
        message: 'User registered successfully',
        token: nestJsToken,
        firebaseToken: firebaseToken,
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          role,
        },
      };
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new BadRequestException('Email already exists');
      }
      if (error.code === 'auth/invalid-email') {
        throw new BadRequestException('Invalid email format');
      }
      if (error.code === 'auth/weak-password') {
        throw new BadRequestException('Password is too weak');
      }
      console.error('SERVER REGISTER ERROR:', error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          `🔴 Firebase API Key Issue: Status=${response.status}, Body:`,
          data,
        );
        const firebaseError = data?.error?.message;
        if (
          firebaseError === 'EMAIL_NOT_FOUND' ||
          firebaseError === 'INVALID_PASSWORD' ||
          firebaseError === 'USER_DISABLED'
        ) {
          throw new UnauthorizedException('Invalid email or password');
        }
        throw new InternalServerErrorException(
          'Authentication service failed (Check API Key)',
        );
      }

      const uid = data.localId;

      const userDoc = await this.fireStoreService.firestore
        .collection('users')
        .doc(uid)
        .get();

      if (!userDoc.exists) {
        throw new InternalServerErrorException(
          'User profile not found in database.',
        );
      }

      const userData = userDoc.data();
      const role = userData?.role;

      const nestJsToken = await this.jwtService.signAsync({ uid, role });
      const firebaseToken =
        await this.fireStoreService.auth.createCustomToken(uid);

      return {
        success: true,
        token: nestJsToken,
        firebaseToken: firebaseToken,
        user: {
          uid: uid,
          email: data.email,
          displayName: userData?.displayName,
          role: role,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      console.error('SERVER LOGIN ERROR (Unexpected):', error);
      throw new InternalServerErrorException(
        'Login failed due to unexpected error',
      );
    }
  }

  async changePassword(
    uid: string,
    email: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const verifyResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: currentPassword,
            returnSecureToken: true,
          }),
        },
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        console.error('Change Password Error (Verify):', verifyData);
        throw new UnauthorizedException('Current password is incorrect');
      }

      await this.fireStoreService.auth.updateUser(uid, {
        password: newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Change Password Error (Admin SDK):', error);
      throw new BadRequestException('Failed to change password');
    }
  }
}
