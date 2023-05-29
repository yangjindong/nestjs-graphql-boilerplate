import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
export class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
    });
  }
}
