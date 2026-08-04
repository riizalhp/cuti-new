import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CvModule } from './cv/cv.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [PrismaModule, AuthModule, CvModule, TemplateModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
