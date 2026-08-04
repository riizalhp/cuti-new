import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { AtsCalculatorService } from './services/ats-calculator.service';
import { mapCvToResponse } from './dto/cv-response.dto';

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

    const cv = await this.prisma.cV.create({
      data: {
        userId,
        title: dto.title,
        templateId: dto.templateId,
        ...(dto.personalInfo && { personalInfo: dto.personalInfo }),
        ...(dto.summary && { summary: dto.summary }),
        ...(dto.experiences && { experiences: dto.experiences }),
        ...(dto.education && { education: dto.education }),
        ...(dto.skills && { skills: dto.skills }),
        ...(dto.certifications && { certifications: dto.certifications }),
        ...(dto.projects && { projects: dto.projects }),
        ...(dto.languages && { languages: dto.languages }),
        atsScore,
        completeness,
      },
    });

    return mapCvToResponse(cv);
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [cvs, total] = await Promise.all([
      this.prisma.cV.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cV.count({ where: { userId } }),
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
    const cv = await this.prisma.cV.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return mapCvToResponse(cv);
  }

  async update(id: string, dto: UpdateCvDto) {
    // Get existing CV
    const existingCv = await this.prisma.cV.findUnique({
      where: { id },
    });

    if (!existingCv) {
      throw new NotFoundException('CV not found');
    }

    // Merge existing data with updates
    const updatedData = {
      personalInfo: dto.personalInfo ?? existingCv.personalInfo,
      summary: dto.summary ?? existingCv.summary,
      experiences: dto.experiences ?? existingCv.experiences,
      education: dto.education ?? existingCv.education,
      skills: dto.skills ?? existingCv.skills,
      certifications: dto.certifications ?? existingCv.certifications,
      projects: dto.projects ?? existingCv.projects,
      languages: dto.languages ?? existingCv.languages,
    };

    // Recalculate ATS score with updated data
    // Cast JsonValue fields to the types expected by ATS calculator
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

    const cv = await this.prisma.cV.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.templateId !== undefined && { templateId: dto.templateId }),
        ...(dto.personalInfo !== undefined && { personalInfo: dto.personalInfo }),
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.experiences !== undefined && { experiences: dto.experiences }),
        ...(dto.education !== undefined && { education: dto.education }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.certifications !== undefined && { certifications: dto.certifications }),
        ...(dto.projects !== undefined && { projects: dto.projects }),
        ...(dto.languages !== undefined && { languages: dto.languages }),
        atsScore,
        completeness,
      },
    });

    return mapCvToResponse(cv);
  }

  async remove(id: string) {
    const cv = await this.prisma.cV.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    await this.prisma.cV.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async setPrimary(id: string, userId: string) {
    const cv = await this.prisma.cV.findUnique({
      where: { id },
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Unset all other CVs as primary
    await this.prisma.cV.updateMany({
      where: { userId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set this CV as primary
    const updatedCv = await this.prisma.cV.update({
      where: { id },
      data: { isPrimary: true },
    });

    return mapCvToResponse(updatedCv);
  }
}
