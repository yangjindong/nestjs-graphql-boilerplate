import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { OrdersResolver } from './orders.resolver';
import { OrdersService } from './orders.service';

import { Order, OrderSchema } from './schemas/orders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
