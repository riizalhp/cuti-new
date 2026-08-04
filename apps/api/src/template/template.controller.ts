import { Controller, Get, Param } from '@nestjs/common';
import { TemplateService } from './template.service';

@Controller('v1/template')
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Get()
  async findAll() {
    const data = await this.templateService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.templateService.findOne(id);
    return { success: true, data };
  }
}
