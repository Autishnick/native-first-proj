import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as admin from 'firebase-admin';
import { Strategy } from 'passport-custom';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(req: any): Promise<any> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedToken.uid) {
        return null;
      }

      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      const userData = userDoc.data();

      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData?.role || decodedToken.role,
        displayName: userData?.displayName,
      };
    } catch (error) {
      console.error('Token validation failed:', error.message);
      return null;
    }
  }
}
