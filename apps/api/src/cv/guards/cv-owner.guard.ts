import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CvOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const cvId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!cvId) {
      throw new ForbiddenException('CV ID not provided');
    }

    const cv = await this.prisma.cv_projects.findUnique({
      where: { id: cvId },
      select: { user_id: true },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (cv.user_id !== user.id) {
      throw new ForbiddenException('You do not own this CV');
    }

    return true;
  }
}
