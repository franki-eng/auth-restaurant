import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [ TypeOrmModule ]
})
export class AuthModule {}
