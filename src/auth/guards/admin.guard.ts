import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (request.user) {
      const user = <User>request.user;
      if (this.usersService.isAdmin(user.permissions)) return true;
    }
    throw new UnauthorizedException(
      'Could not authenticate with token or user does not have permissions',
    );
  }
}
