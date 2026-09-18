import { z } from 'zod';
import { createCvSchema } from '@employr/types';

export const createCvDtoSchema = createCvSchema;

export type CreateCvDto = z.infer<typeof createCvDtoSchema>;
