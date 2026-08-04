import { CvResponse } from '@cuti/types';

export type CvResponseDto = CvResponse;

export function mapCvToResponse(cv: any): CvResponseDto {
  return {
    id: cv.id,
    userId: cv.userId,
    title: cv.title,
    templateId: cv.templateId,
    personalInfo: cv.personalInfo,
    summary: cv.summary,
    experiences: cv.experiences,
    education: cv.education,
    skills: cv.skills,
    certifications: cv.certifications,
    projects: cv.projects,
    languages: cv.languages,
    atsScore: cv.atsScore,
    completeness: cv.completeness,
    status: cv.status,
    isPrimary: cv.isPrimary,
    pdfUrl: cv.pdfUrl,
    createdAt: cv.createdAt.toISOString(),
    updatedAt: cv.updatedAt.toISOString(),
  };
}
