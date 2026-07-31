import { z } from 'zod';

export const settingsSchema = z.object({
  general: z.object({
    currency: z.object({
      symbol: z.string(),
      decimals: z.number(),
      thousandSep: z.string(),
      decimalSep: z.string(),
      position: z.enum(['left', 'left_space', 'right', 'right_space']),
    }),
    defaultCartQuantity: z.number(),
    defaultPageSize: z.number(),
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
