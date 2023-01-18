import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';

const apiName = 'offchain-purchase-service';

export async function bootstrap(host: string, prefix: string, port: number) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [process.env.CORS_ORIGIN],
      methods: ['POST', 'PUT', 'GET'],
    },
  });

  app.disable('x-powered-by');

  app.setGlobalPrefix(prefix);

  const config = new DocumentBuilder()
    .setTitle(apiName)
    .setDescription('API for offchain-purchases')
    .setVersion('1.0')
    .addTag('purchase')
    .build();

  if (process.env.NODE_ENV === 'development') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${prefix}/docs`, app, document);

    // TODO: add interceptor de erros 429, 500, 400
  }

  await app.listen(port);
  const entrypoint = `http://${host}:${port}/${prefix}`;

  Logger.log(
    `🌱 ${apiName} by KannaDAO (${process.env.NODE_ENV}) running on ${entrypoint} `,
  );
}
