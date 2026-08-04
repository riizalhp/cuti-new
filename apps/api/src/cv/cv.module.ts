import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvOwnerGuard } from './guards/cv-owner.guard';
import { AtsCalculatorService } from './services/ats-calculator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CvController],
  providers: [CvService, CvOwnerGuard, AtsCalculatorService],
  exports: [CvService],
})
export class CvModule {}
