import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
require('dotenv').config();
async function bootstrap() {
  const fs = require('fs');
  let app;
  // console.log(process.env.SSL_HTTP);
  // if (process.env.SSL_HTTP == 'true') {
  // console.log('here');
  // const caFile = fs.readFileSync('src/config/certs/__beesuite_app.crt');
  // const certFile = fs.readFileSync('src/config/certs/wildcard_beesuite_app.crt', 'utf8');
  // const keyFile = fs.readFileSync('src/config/certs/wildcard_beesuite_app.key', 'utf8');
  // const pfxFile = fs.readFileSync('src/config/certs/wildcard_beesuite_app.pfx');
  // const pfxFile = fs.readFileSync(process.env.PFX_PATH);

  // const cerFile = fs.readFileSync('src/config/certs/certDigi.cer', 'utf8');

  // fs.readFileSync('src/config/certlocal.pfx');
  // const certFile = fs.readFileSync(process.env.SSL_CERT_PATH);
  // const keyFile = fs.readFileSync(process.env.SSL_KEY_PATH);
  // app = await NestFactory.create(AppModule, { cors: true, httpsOptions: { cert: certFile, key: keyFile } });
  // app = await NestFactory.create(AppModule, { cors: true, httpsOptions: { cert: cerFile } });
  // app = await NestFactory.create(AppModule, { cors: true, httpsOptions: { cert: certFile, key: keyFile } });

  // app = await NestFactory.create(AppModule, { cors: true, httpsOptions: { pfx: pfxFile, passphrase: process.env.PFX_PASS } });

  // } else {
  // console.log('hero');
  app = await NestFactory.create(AppModule, { cors: true });
  // }

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
    .setSchemes("http", "https")
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, document);

  let port = process.env.PORT || 3000;
  Logger.log('Program running on port ' + port, 'PORT:' + port);

  await app.listen(port);
}
bootstrap();
