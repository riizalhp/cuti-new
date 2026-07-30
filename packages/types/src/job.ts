import { z } from 'zod';

export const createJobSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  url: z.string().url().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  notes: z.string().optional(),
});

export const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  url: z.string().url().optional(),
  location: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['sent', 'screening', 'interview', 'offering', 'rejected']).optional(),
  notes: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export interface JobResponse {
  id: string;
  userId: string;
  company: string;
  position: string;
  url: string | null;
  location: string | null;
  salary: string | null;
  status: 'sent' | 'screening' | 'interview' | 'offering' | 'rejected';
  appliedAt: string;
  responseAt: string | null;
  interviewDate: string | null;
  notes: string | null;
  timeline: unknown;
  createdAt: string;
  updatedAt: string;
}
