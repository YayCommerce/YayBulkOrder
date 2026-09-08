import { z } from 'zod';

export const settingsSchema = z.object({
  general: z.object({
    defaultCartQuantity: z.number().min(1),
    defaultPageSize: z.number().min(1),
  }),
  colors: z.object({
    primary: z.string(),
    text: z.string(),
    textHover: z.string(),
    description: z.string(),
    border: z.string(),
    background: z.string(),
    buttonBackground: z.string(),
    buttonBackgroundHover: z.string(),
    buttonText: z.string(),
    buttonTextHover: z.string(),
  }),
  purchaseList: z.object({
    isAddToAccountPage: z.boolean(),
    savePurchaseListButton: z.object({
      isAddToCartPage: z.boolean(),
      isAddToCheckoutPage: z.boolean(),
      isAddToMiniCart: z.boolean(),
      isAddToOrder: z.boolean(),
    }),
  }),
  csvOrder: z.object({
    isAddToAccountPage: z.boolean(),
  }),
});
export type Settings = z.infer<typeof settingsSchema>;
