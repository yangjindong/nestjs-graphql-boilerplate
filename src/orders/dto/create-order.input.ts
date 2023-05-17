import { Field, InputType } from '@nestjs/graphql';

import { ObjectIdScalar } from '@/scalars';

@InputType()
export class CreateOrderInput {
  @Field()
  name: string;

  @Field(() => ObjectIdScalar)
  owner: string;
}
