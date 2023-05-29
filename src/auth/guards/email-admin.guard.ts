import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthenticationError } from '@/errors';
import { User } from '@/users/schemas/user.schema';

import { UsersService } from '../../users/users.service';

// Check if email in field for query matches authenticated user's email
// or if the user is admin
@Injectable()
export class EmailAdminGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  // Returns an array of all the properties of an object separated by a .
  getPropertiesArray(object: any): string[] {
    let result: string[] = [];
    Object.entries(object).forEach(([key, value]) => {
      const field = key;
      if (typeof value === 'object' && value !== null) {
        const objectProperties = this.getPropertiesArray(value).map(
          (prop) => `${field}.${prop}`,
        );
        result = result.concat(objectProperties);
      } else {
        result.push(field);
      }
    });
    return result;
  }

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

      if (
        shouldActivate === false &&
        this.usersService.isAdmin(user.permissions)
      ) {
        const adminAllowedArgs = this.reflector.get<string[]>(
          'adminAllowedArgs',
          context.getHandler(),
        );

        shouldActivate = true;

        if (adminAllowedArgs) {
          const argFields = this.getPropertiesArray(args);
          argFields.forEach((field) => {
            if (!adminAllowedArgs.includes(field)) {
              throw new AuthenticationError(
                `Admin is not allowed to modify ${field}`,
              );
            }
          });
        }
      }
    }
    if (!shouldActivate) {
      throw new UnauthorizedException(
        'Could not authenticate with token or user does not have permissions',
      );
    }
    return shouldActivate;
  }
}
