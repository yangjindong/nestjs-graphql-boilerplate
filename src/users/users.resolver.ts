import { BadRequestException } from '@nestjs/common';
import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';

import { CreateUserInput, LoginResult } from './dto/user.input';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => String }) id: string) {
    console.log(id);
    return this.usersService.findOne(id);
  }

  @Mutation(() => LoginResult)
  async register(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<LoginResult> {
    console.log(createUserInput);
    let createdUser: LoginResult | undefined;
    try {
      createdUser = await this.usersService.create(createUserInput);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return createdUser;
  }
}
