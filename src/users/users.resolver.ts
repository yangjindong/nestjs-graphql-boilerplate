import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AdminAllowedArgs } from '@/auth/decorators';
import { AdminGuard, EmailAdminGuard, JwtAuthGuard } from '@/auth/guards';

import { UserInputError, ValidationError } from '@/errors';

import { CreateUserInput, UpdateUserInput } from './dto/user.input';
import { User, UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, AdminGuard)
  users(): Promise<UserDocument[]> {
    return this.usersService.getAllUsers();
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard, EmailAdminGuard)
  async user(@Args('email') email?: string): Promise<User> {
    let user: User | undefined;
    if (email) {
      user = await this.usersService.findOneByEmail(email);
    } else {
      // Is this the best exception for a graphQL error?
      throw new ValidationError('A email must be included');
    }

    if (user) return user;
    throw new UserInputError('The user does not exist');
  }

  // A NotFoundException is intentionally not sent so bots can't search for emails
  @Query(() => Boolean)
  async forgotPassword(@Args('email') email: string): Promise<boolean> {
    return await this.usersService.forgotPassword(email);
  }

  // What went wrong is intentionally not sent (wrong username or code or user not in reset status)
  @Mutation(() => User)
  async resetPassword(
    @Args('username') username: string,
    @Args('code') code: string,
    @Args('password') password: string,
  ): Promise<User> {
    const user = await this.usersService.resetPassword(
      username,
      code,
      password,
    );
    if (!user) throw new UserInputError('The password was not reset');
    return user;
  }

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    let createdUser: User | undefined;
    try {
      createdUser = await this.usersService.create(createUserInput);
    } catch (error) {
      throw new UserInputError(error.message);
    }
    return createdUser;
  }

  @Mutation(() => User)
  @AdminAllowedArgs('email', 'fieldsToUpdate.email', 'fieldsToUpdate.enabled')
  @UseGuards(JwtAuthGuard, EmailAdminGuard)
  async updateUser(
    @Args('email') email: string,
    @Args('fieldsToUpdate') fieldsToUpdate: UpdateUserInput,
    @Context('req') request: any,
  ): Promise<User> {
    let user: UserDocument | undefined;
    if (!email && request.user) email = request.user.email;
    try {
      user = await this.usersService.update(email, fieldsToUpdate);
    } catch (error) {
      throw new ValidationError(error.message);
    }
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async addAdminPermission(@Args('email') email: string): Promise<User> {
    const user = await this.usersService.addPermission('admin', email);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async removeAdminPermission(@Args('email') email: string): Promise<User> {
    const user = await this.usersService.removePermission('admin', email);
    if (!user) throw new UserInputError('The user does not exist');
    return user;
  }

  @Query(() => User)
  findOneByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.findOneByEmail(email);
  }
}
