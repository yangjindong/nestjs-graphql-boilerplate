import { GraphQLError } from 'graphql';
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}
