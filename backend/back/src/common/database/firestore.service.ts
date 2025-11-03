// Always write all code in English, including text in the code.
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FireStoreService {
  private db: admin.firestore.Firestore;
  private _auth: admin.auth.Auth;
  // 1. Add private property for FieldValue
  private _FieldValue: typeof admin.firestore.FieldValue;
  private readonly logger = new Logger(FireStoreService.name);

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.error(
        'Firebase config validation failed. Check your .env file.',
      );
      this.logger.error(
        'Missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY',
      );
      throw new Error('Missing Firebase configuration in .env');
    }

    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };

    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      this.db = admin.firestore();
      this._auth = admin.auth();
      // 2. Initialize FieldValue here
      this._FieldValue = admin.firestore.FieldValue;
      this.logger.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error) {
      this.logger.error(
        '❌ Error initializing Firebase Admin SDK:',
        error.message,
      );
    }
  }

  get firestore(): admin.firestore.Firestore {
    if (!this.db) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    return this.db;
  }

  get auth(): admin.auth.Auth {
    if (!this._auth) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    return this._auth;
  }

  // 3. Add a public getter for FieldValue
  get FieldValue(): typeof admin.firestore.FieldValue {
    if (!this._FieldValue) {
      throw new Error('Firebase Admin SDK is not initialized.');
    }
    return this._FieldValue;
  }
}
