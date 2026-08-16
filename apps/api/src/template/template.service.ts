import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapTemplateToResponse } from './dto/template-response.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const templates = await this.prisma.cv_templates.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });

    return templates.map(mapTemplateToResponse);
  }

  async findOne(id: string) {
    const template = await this.prisma.cv_templates.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return mapTemplateToResponse(template);
  }
}
