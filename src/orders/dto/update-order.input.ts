import { PartialType, InputType, Field, ID } from '@nestjs/graphql';

import { CreateOrderInput } from './create-order.input';

@InputType()
export class UpdateOrderInput extends PartialType(CreateOrderInput) {
  @Field(() => ID)
  _id: string;
}
