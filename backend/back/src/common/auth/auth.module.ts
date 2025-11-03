// Always write all code in English, including text in the code.
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Import JwtModule
import { PassportModule } from '@nestjs/passport';
import { FireStoreModule } from '../database/firestore.module'; // <-- 2. Import FireStoreModule
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 3. Add FireStoreModule so AuthService can inject FireStoreService
    FireStoreModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule, // 4. Add ConfigModule

    // --- 5. ADD THIS BLOCK ---
    // This registers JwtService so NestJS can inject it
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule here
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get secret from .env
        signOptions: { expiresIn: '1d' }, // Set token expiration
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
    // --- End of block ---
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy], // You can also export JwtStrategy if other modules need it
})
export class AuthModule {}
