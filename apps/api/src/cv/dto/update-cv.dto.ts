import { z } from 'zod';
import { updateCvSchema } from '@cuti/types';

export const updateCvDtoSchema = updateCvSchema;

export type UpdateCvDto = z.infer<typeof updateCvDtoSchema>;
