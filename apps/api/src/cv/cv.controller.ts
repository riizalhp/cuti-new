import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto, createCvDtoSchema } from './dto/create-cv.dto';
import { UpdateCvDto, updateCvDtoSchema } from './dto/update-cv.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CvOwnerGuard } from './guards/cv-owner.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('v1/cv')
@UseGuards(AuthGuard)
export class CvController {
  constructor(private cvService: CvService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createCvDtoSchema))
  async create(@CurrentUser() user: any, @Body() dto: CreateCvDto) {
    const data = await this.cvService.create(user.id, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.cvService.findAll(user.id, page, limit);
    return { success: true, data: result.data, pagination: result.pagination };
  }

  @Get(':id')
  @UseGuards(CvOwnerGuard)
  async findOne(@Param('id') id: string) {
    const data = await this.cvService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @UseGuards(CvOwnerGuard)
  @UsePipes(new ZodValidationPipe(updateCvDtoSchema))
  async update(@Param('id') id: string, @Body() dto: UpdateCvDto) {
    const data = await this.cvService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(CvOwnerGuard)
  async remove(@Param('id') id: string) {
    const data = await this.cvService.remove(id);
    return { success: true, data };
  }

  @Patch(':id/primary')
  @UseGuards(CvOwnerGuard)
  async setPrimary(@Param('id') id: string, @CurrentUser() user: any) {
    const data = await this.cvService.setPrimary(id, user.id);
    return { success: true, data };
  }
}
