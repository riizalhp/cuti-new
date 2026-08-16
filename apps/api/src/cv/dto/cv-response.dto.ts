import { CvResponse } from '@cuti/types';

export type CvResponseDto = CvResponse;

export function mapCvToResponse(cv: any): CvResponseDto {
  const data = (cv.data as any) || {};
  return {
    id: cv.id,
    userId: cv.user_id,
    title: cv.title,
    templateId: cv.template_id,
    personalInfo: data.personalInfo ?? null,
    summary: data.summary ?? null,
    experiences: data.experiences ?? [],
    education: data.education ?? [],
    skills: data.skills ?? [],
    certifications: data.certifications ?? [],
    projects: data.projects ?? [],
    languages: data.languages ?? [],
    atsScore: data.atsScore ?? 0,
    completeness: data.completeness ?? 0,
    status: cv.status?.toLowerCase?.() || 'draft',
    isPrimary: cv.is_active ?? false,
    pdfUrl: null,
    createdAt: cv.created_at?.toISOString?.() || cv.created_at,
    updatedAt: cv.updated_at?.toISOString?.() || cv.updated_at,
  };
}
