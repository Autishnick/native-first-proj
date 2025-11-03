import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as admin from 'firebase-admin';
import { Strategy } from 'passport-custom';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(req: any): Promise<any> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // ПРИМІТКА: Для 'jwt' стратегії краще повернути 'null',
      // щоб дозволити Passport обробляти 401, але ваш поточний підхід також працює.
      throw new UnauthorizedException('No token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      // Верифікуємо Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!decodedToken.uid) {
        // У цьому випадку 'verifyIdToken' має кинути помилку раніше, але як запобіжник
        return null;
      }

      // Отримуємо додаткові дані користувача з Firestore
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(decodedToken.uid)
        .get();

      const userData = userDoc.data();

      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Якщо роль не прийшла з Firestore, використовуємо роль з custom claims (якщо є)
        role: userData?.role || decodedToken.role,
        displayName: userData?.displayName,
      };
    } catch (error) {
      // ФІКС: Ловимо помилки від verifyIdToken і повертаємо null.
      // Це дозволяє PassportCore (базовому рівню) викинути 401 для токена.
      // Якщо кинути UnauthorizedException, це також спрацює, але повернення null/false чистіше для стратегії.
      console.error('Token validation failed:', error.message);
      return null;
    }
  }
}
