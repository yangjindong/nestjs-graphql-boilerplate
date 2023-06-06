import { ArgumentsHost, Catch, HttpException, Inject } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class ExceptionFilter implements GqlExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof Error) {
      const gqlHost = GqlArgumentsHost.create(host);
      const {
        req: {
          body: { operationName, variables },
        },
      } = gqlHost.getContext();
      const args = `${operationName} ${JSON.stringify(variables)}`;
      const gqlContext = gqlHost.getContext();
      const req = gqlContext.req;
      if (req) {
        this.logger.error(
          `Error: ${exception.message}`,
          {
            message: `Error: ${exception.message}`,
            type: 'error',
            stack: exception.stack,
            requestId: req.headers['request-id'],
            args: args,
          },
          // exception.stack,
        );
      } else {
        this.logger.error(
          `Error: ${exception.message}`,
          {
            message: `Error: ${exception.message}`,
            type: 'error',
            stack: exception.stack,
          },
          // exception.stack,
        );
      }
    }
    return exception;
  }
}
