import {
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Resolver, Args, Query, Context, Mutation } from '@nestjs/graphql';

import { CurrentUser } from '@/auth/decorators';

import {
  CreateUserInput,
  LoginResult,
  LoginUserInput,
} from '../users/dto/user.input';

import { User, UserDocument } from '../users/schemas/user.schema';

import { UsersService } from './../users/users.service';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';

type Login = {
  user: User;
  token: string;
};

@Resolver('Auth')
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Mutation(() => LoginResult)
  async login(
    @Args('loginUserInput') loginUserInput: LoginUserInput,
  ): Promise<Login> {
    const result = await this.authService.validateUserByPassword(
      loginUserInput,
    );

    if (result) return result;
    throw new BadRequestException(
      'Could not login with the provided credentials',
    );
  }

  @Mutation(() => LoginResult)
  async register(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<LoginResult> {
    let createdUser: LoginResult | undefined;
    try {
      createdUser = await this.authService.register(createUserInput);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return createdUser;
  }

  // There is no username guard here because if the person has the token, they can be any user
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Context('req') request: any): Promise<string> {
    // console.log(request);
    const user: UserDocument = request.user;
    if (!user)
      throw new UnauthorizedException(
        'Could not login with the provided credentials',
      );
    const result = await this.authService.createJwt(user);
    if (result) return result.token;
    throw new UnauthorizedException(
      'Could not log-in with the provided credentials',
    );
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: User) {
    return this.usersService.findOneByEmail(user.email);
  }
}
