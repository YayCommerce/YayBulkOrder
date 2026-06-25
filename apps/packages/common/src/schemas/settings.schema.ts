import { z } from 'zod';

export const settingsSchema = z.object({
  general: z.object({
    defaultCartQuantity: z.number(),
    pageSize: z.number(),
  }),
  colors: z.object({
    primary: z.string(),
    text: z.string(),
    description: z.string(),
    border: z.string(),
    background: z.string(),
  }),
});
export type Settings = z.infer<typeof settingsSchema>;
