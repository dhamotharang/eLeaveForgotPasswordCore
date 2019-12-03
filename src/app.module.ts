import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ForgotPasswordModule } from './forgot-password/forgot-password.module';

@Module({
  imports: [ForgotPasswordModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
