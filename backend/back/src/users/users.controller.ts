// Always write all code in English, including text in the code.
// src/profile/profile.controller.ts

import {
  Controller,
  Get,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard'; // Adjust path to your JwtAuthGuard
import { UsersService } from '../users/users.service';

@Controller('profile')
export class ProfileController {
  constructor(
    // Inject the UsersService you already built
    private readonly usersService: UsersService,
  ) {}

  /**
   * @route   GET /api/profile/me
   * @desc    Get current logged in user's profile
   * @access  Private (Requires JWT Token)
   */
  @UseGuards(JwtAuthGuard) // Protect this route
  @Get('me') // This handles the '/me' part of '/profile/me'
  async getMyProfile(@Request() req) {
    // The JwtAuthGuard will validate the token and attach the
    // user payload (containing the uid) to the request object.
    const userUid = req.user?.uid;

    if (!userUid) {
      // This should theoretically not happen if JwtAuthGuard is working
      throw new NotFoundException('User UID not found in authentication token');
    }

    // Now, use your existing UsersService to find the user data
    // This is exactly what your frontend expects
    return this.usersService.findOne(userUid);
  }
}
