import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field()
  name: string;

  // @Field(() => ObjectIdScalar)
  // owner: string;
}
