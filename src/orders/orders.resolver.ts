import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from 'src/users/schemas/user.schema';

import { CurrentUser } from '@/auth/decorators';

import { JwtAuthGuard } from '@/auth/guards';

import { CreateOrderInput } from './dto/create-order.input';
import { OrdersService } from './orders.service';
import { Order } from './schemas/orders.schema';

@Resolver()
export class OrdersResolver {
  constructor(private readonly orderService: OrdersService) {}

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Args('createOrder') createOrderInput: CreateOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.orderService.create(createOrderInput, user);
  }

  @Query(() => [Order])
  @UseGuards(JwtAuthGuard)
  orders(@CurrentUser() user: User): Promise<Order[]> {
    return this.orderService.findAll(user);
  }
}
