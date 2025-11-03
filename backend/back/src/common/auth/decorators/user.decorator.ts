import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from 'src/users/entities/user.entity';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserProfile => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
