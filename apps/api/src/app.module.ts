import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CvModule } from './cv/cv.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    CvModule,
    TemplateModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
