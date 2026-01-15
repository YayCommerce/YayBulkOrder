import { z } from 'zod';

export const settingsFormSchema = z.object({
  general: z.object({
    defaultCartQuantity: z.number(),
  }),
  styles: z.object({
    colors: z.object({
      primary: z.string(),
      textNormal: z.string(),
      backgroundNormal: z.string(),
      textSecondary: z.string(),
      backgroundSecondary: z.string(),
      borderColor: z.string(),
    }),
    borderRadius: z.enum(['small', 'normal', 'large']),
  }),
});
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
