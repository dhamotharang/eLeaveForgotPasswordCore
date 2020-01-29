import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true
    }
  ));

  const options = new DocumentBuilder()
    .setTitle('Forgot password eLeave REST API')
    .setDescription('This is API for eLeave forgot password service')
    .setVersion('1.0')
    .addTag('leave')
    .addBearerAuth('Authorization', 'header', 'apiKey')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  let port = process.env.PORT || 3002;
  Logger.log('Program running on port ' + port, 'PORT:' + port);

  await app.listen(port);
}
bootstrap();
