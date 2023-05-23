import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateOrderInput } from './dto/create-order.input';
import { Order, OrderDocument } from './schemas/orders.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}
  async create(createOrderInput: CreateOrderInput, user): Promise<Order> {
    const createdOrder = new this.orderModel({
      ...createOrderInput,
      owner: user._id,
    });
    createdOrder.save();
    return this.orderModel
      .findOne({ _id: createdOrder._id })
      .populate('owner', 'email');
  }

  async findAll(user): Promise<Order[]> {
    return this.orderModel
      .find({ owner: user._id })
      .populate('owner', 'email')
      .exec();
  }
}
