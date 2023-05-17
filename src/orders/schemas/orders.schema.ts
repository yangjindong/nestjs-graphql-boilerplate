import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

import { User } from '../../users/schemas/user.schema';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
@ObjectType()
export class Order {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop()
  name: string;

  @Field(() => User)
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  owner: User;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
