// import { Scalar } from '@nestjs/graphql';
// import { Kind, ASTNode } from 'graphql';
// import { Types } from 'mongoose';

// @Scalar('ObjectId')
// export class ObjectIdScalar {
//   description = 'MongoDB ObjectId scalar type, sent as 24 byte Hex String';

//   parseValue(value: string) {
//     return new Types.ObjectId(value); // value from the client
//   }

//   serialize(value: Types.ObjectId) {
//     return value.toHexString(); // value sent to the client
//   }

//   parseLiteral(ast: ASTNode) {
//     if (ast.kind === Kind.STRING) {
//       return new Types.ObjectId(ast.value); // ast value is always in string format
//     }
//     return null;
//   }
// }

// export default ObjectIdScalar;

import { GraphQLScalarType, Kind } from 'graphql';
import { Types } from 'mongoose';

export const ObjectIdScalar = new GraphQLScalarType({
  name: 'ObjectId',
  description: 'Mongo object id scalar type',
  serialize(value: unknown): string {
    // check the type of received value
    if (!(value instanceof Types.ObjectId)) {
      throw new Error('ObjectIdScalar can only serialize ObjectId values');
    }
    return value.toHexString(); // value sent to the client
  },
  parseValue(value: unknown): Types.ObjectId {
    // check the type of received value
    if (typeof value !== 'string') {
      throw new Error('ObjectIdScalar can only parse string values');
    }
    return new Types.ObjectId(value); // value from the client input variables
  },
  parseLiteral(ast): Types.ObjectId {
    // check the type of received value
    if (ast.kind !== Kind.STRING) {
      throw new Error('ObjectIdScalar can only parse string values');
    }
    return new Types.ObjectId(ast.value); // value from the client query
  },
});

export default ObjectIdScalar;
