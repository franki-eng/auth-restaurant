import { Module } from '@nestjs/common';
import { MailerService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ ConfigModule ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailModule {}
