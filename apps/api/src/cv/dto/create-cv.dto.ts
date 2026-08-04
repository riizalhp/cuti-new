import { z } from 'zod';
import { createCvSchema } from '@cuti/types';

export const createCvDtoSchema = createCvSchema;

export type CreateCvDto = z.infer<typeof createCvDtoSchema>;
