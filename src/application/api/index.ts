import {Logger} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {type NestExpressApplication} from '@nestjs/platform-express';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {AppModule} from './modules/app/app.module';
import helmet from 'helmet';
import {ExceptionFilterMiddleware} from './filters/exception.filter';
import {FakeGatewayExceptionHandler} from './exception-handler/exception.handler';

const apiName = 'offchain-purchase-service';

export async function bootstrap(host: string, prefix: string, port: number) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  app.setGlobalPrefix(prefix);
  app.useGlobalFilters(
    new ExceptionFilterMiddleware(new FakeGatewayExceptionHandler()),
  );

  app.enableCors({
    origin: [process.env.CORS_ORIGIN],
    methods: ['POST', 'HEAD', 'PUT', 'PATCH', 'GET', 'PATCH', 'OPTIONS'],
  });

  app.disable('x-powered-by');
  app.enable('trust proxy');

  const config = new DocumentBuilder()
    .setTitle(apiName)
    .setDescription('API for Offchain Services')
    .setVersion('1.0')
    .addTag('offchain')
    .build();

  if (process.env.NODE_ENV === 'development' || process.env.SWAGGER_ENABLED) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${prefix}/docs`, app, document);
  }

  await app.listen(port);
  const entrypoint = `http://${host}:${port}/${prefix}`;

  Logger.log(
    `🌱 ${apiName} by KannaDAO (${process.env.NODE_ENV}) running on ${entrypoint} `,
  );
}
