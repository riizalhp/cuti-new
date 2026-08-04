import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { mapTemplateToResponse } from './dto/template-response.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const templates = await this.prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(mapTemplateToResponse);
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return mapTemplateToResponse(template);
  }
}
