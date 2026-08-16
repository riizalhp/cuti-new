import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AtsCalculatorService } from './services/ats-calculator.service';
import { mapCvToResponse } from './dto/cv-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class CvService {
  constructor(
    private prisma: PrismaService,
    private atsCalculator: AtsCalculatorService,
  ) {}

  async create(userId: string, dto: CreateCvDto) {
    // Calculate ATS score
    const atsScore = this.atsCalculator.calculateScore({
      personalInfo: dto.personalInfo,
      summary: dto.summary,
      experiences: dto.experiences,
      education: dto.education,
      skills: dto.skills,
      certifications: dto.certifications,
      projects: dto.projects,
      languages: dto.languages,
    });

    // Calculate completeness (percentage of filled sections)
    const totalSections = 8;
    let filledSections = 0;
    if (dto.personalInfo) filledSections++;
    if (dto.summary) filledSections++;
    if (dto.experiences?.length) filledSections++;
    if (dto.education?.length) filledSections++;
    if (dto.skills?.length) filledSections++;
    if (dto.certifications?.length) filledSections++;
    if (dto.projects?.length) filledSections++;
    if (dto.languages?.length) filledSections++;
    const completeness = (filledSections / totalSections) * 100;

    const cvData = {
      personalInfo: dto.personalInfo,
      summary: dto.summary,
      experiences: dto.experiences,
      education: dto.education,
      skills: dto.skills,
      certifications: dto.certifications,
      projects: dto.projects,
      languages: dto.languages,
      atsScore,
      completeness,
    };

    const cv = await this.prisma.cv_projects.create({
      data: {
        id: crypto.randomUUID(),
        user_id: userId,
        title: dto.title,
        template_id: dto.templateId ?? 'default',
        target_position: (dto.personalInfo as any)?.targetPosition || dto.title || 'General',
        data: cvData,
        status: 'DRAFT',
        is_active: true,
        updated_at: new Date(),
      },
    });

    return mapCvToResponse(cv);
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [cvs, total] = await Promise.all([
      this.prisma.cv_projects.findMany({
        where: { user_id: userId },
        orderBy: { updated_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cv_projects.count({ where: { user_id: userId } }),
    ]);

    return {
      data: cvs.map(mapCvToResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cv = await this.prisma.cv_projects.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return mapCvToResponse(cv);
  }

  async update(id: string, dto: UpdateCvDto) {
    // Get existing CV
    const existingCv = await this.prisma.cv_projects.findUnique({
      where: { id },
    });

    if (!existingCv) {
      throw new NotFoundException('CV not found');
    }

    const existingData = (existingCv.data as any) || {};

    // Merge existing data with updates
    const updatedData = {
      personalInfo: dto.personalInfo ?? existingData.personalInfo,
      summary: dto.summary ?? existingData.summary,
      experiences: dto.experiences ?? existingData.experiences,
      education: dto.education ?? existingData.education,
      skills: dto.skills ?? existingData.skills,
      certifications: dto.certifications ?? existingData.certifications,
      projects: dto.projects ?? existingData.projects,
      languages: dto.languages ?? existingData.languages,
    };

    // Recalculate ATS score with updated data
    const atsScore = this.atsCalculator.calculateScore({
      personalInfo: (updatedData.personalInfo as any) ?? undefined,
      summary: (updatedData.summary as string) ?? undefined,
      experiences: (updatedData.experiences as any[]) ?? undefined,
      education: (updatedData.education as any[]) ?? undefined,
      skills: (updatedData.skills as any[]) ?? undefined,
      certifications: (updatedData.certifications as any[]) ?? undefined,
      projects: (updatedData.projects as any[]) ?? undefined,
      languages: (updatedData.languages as any[]) ?? undefined,
    });

    // Recalculate completeness
    const totalSections = 8;
    let filledSections = 0;
    if (updatedData.personalInfo) filledSections++;
    if (updatedData.summary) filledSections++;
    if (updatedData.experiences && Array.isArray(updatedData.experiences) && updatedData.experiences.length > 0) filledSections++;
    if (updatedData.education && Array.isArray(updatedData.education) && updatedData.education.length > 0) filledSections++;
    if (updatedData.skills && Array.isArray(updatedData.skills) && updatedData.skills.length > 0) filledSections++;
    if (updatedData.certifications && Array.isArray(updatedData.certifications) && updatedData.certifications.length > 0) filledSections++;
    if (updatedData.projects && Array.isArray(updatedData.projects) && updatedData.projects.length > 0) filledSections++;
    if (updatedData.languages && Array.isArray(updatedData.languages) && updatedData.languages.length > 0) filledSections++;
    const completeness = (filledSections / totalSections) * 100;

    const cv = await this.prisma.cv_projects.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.templateId !== undefined && { template_id: dto.templateId }),
        data: {
          ...updatedData,
          atsScore,
          completeness,
        },
        updated_at: new Date(),
      },
    });

    return mapCvToResponse(cv);
  }

  async remove(id: string) {
    const cv = await this.prisma.cv_projects.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    await this.prisma.cv_projects.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async setPrimary(id: string, userId: string) {
    const cv = await this.prisma.cv_projects.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Unset all other CVs as primary
    await this.prisma.cv_projects.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false },
    });

    // Set this CV as primary
    const updatedCv = await this.prisma.cv_projects.update({
      where: { id },
      data: { is_active: true, updated_at: new Date() },
    });

    return mapCvToResponse(updatedCv);
  }
}
