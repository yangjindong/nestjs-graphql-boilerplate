import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthenticationError } from '@/errors';
import { User } from '@/users/schemas/user.schema';

// Check if email in field for query matches authenticated user's email
// or if the user is admin
@Injectable()
export class UsernameEmailGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    let shouldActivate = false;
    if (request.user) {
      const user = <User>request.user;
      const args = ctx.getArgs();
      if (args.email && typeof args.email === 'string') {
        shouldActivate = args.email.toLowerCase() === user.email.toLowerCase();
      } else if (!args.email) {
        shouldActivate = true;
      }
    }
    if (!shouldActivate) {
      throw new AuthenticationError(
        'Could not authenticate with token or user does not have permissions',
      );
    }
    return shouldActivate;
  }
}
