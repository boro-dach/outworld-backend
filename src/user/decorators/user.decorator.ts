import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'generated/prisma';

export const CurrentUser = createParamDecorator(
  (data: keyof User, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not available in request');
    }

    if (data && user[data] === undefined) {
      throw new UnauthorizedException(
        `User property ${String(data)} not found`,
      );
    }

    return data ? user[data] : user;
  },
);
