import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().url().optional(),
  portfolio: z.string().url().optional(),
  photo: z.string().url().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  gpa: z.number().min(0).max(4).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

export const createCvSchema = z.object({
  title: z.string().min(1).max(100),
  templateId: z.string().uuid().optional(),
  personalInfo: personalInfoSchema.optional(),
  summary: z.string().max(500).optional(),
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string(),
    credentialUrl: z.string().url().optional(),
  })).optional(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    techStack: z.array(z.string()).optional(),
    url: z.string().url().optional(),
  })).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.enum(['basic', 'conversational', 'professional', 'native']),
  })).optional(),
});

export const updateCvSchema = createCvSchema.partial();

export type CreateCvInput = z.infer<typeof createCvSchema>;
export type UpdateCvInput = z.infer<typeof updateCvSchema>;

export interface CvResponse {
  id: string;
  userId: string;
  title: string;
  templateId: string | null;
  personalInfo: unknown;
  summary: string | null;
  experiences: unknown;
  education: unknown;
  skills: unknown;
  certifications: unknown;
  projects: unknown;
  languages: unknown;
  atsScore: number | null;
  completeness: number | null;
  status: 'draft' | 'active' | 'archived';
  isPrimary: boolean;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
