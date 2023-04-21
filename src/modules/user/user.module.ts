import { Module } from '@nestjs/common';
import { PrismaService } from 'src/global-services/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [
    UserService, 
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class UserModule {}