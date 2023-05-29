import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED },
    });
  }
}
