// Always write all code in English, including text in the code.
// src/profile/profile.controller.ts

import {
  Controller,
  Get,
  NotFoundException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Request() req) {
    const userUid = req.user?.uid;

    if (!userUid) {
      throw new NotFoundException('User UID not found in authentication token');
    }

    return this.usersService.findOne(userUid);
  }
}
