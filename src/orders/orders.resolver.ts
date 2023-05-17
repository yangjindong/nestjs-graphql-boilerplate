import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth.guard';

import { CurrentUser } from 'src/decorators/current-user.decorator';

import { User } from 'src/users/schemas/user.schema';

import { CreateOrderInput } from './dto/create-order.input';
import { OrdersService } from './orders.service';
import { Order } from './schemas/orders.schema';

@Resolver()
export class OrdersResolver {
  constructor(private readonly orderService: OrdersService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Order)
  createOrder(
    @Args('createOrder') createOrderInput: CreateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.orderService.create(createOrderInput, user);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Order])
  orders(): Promise<Order[]> {
    return this.orderService.findAll();
  }
}
