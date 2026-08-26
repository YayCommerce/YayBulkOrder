import { z } from 'zod';

export const settingsSchema = z.object({
  general: z.object({
    defaultCartQuantity: z.number().min(1),
    defaultPageSize: z.number().min(1),
  }),
  design: z.object({
    primaryColor: z.string(),
    textColor: z.string(),
    textHoverColor: z.string(),
    descriptionColor: z.string(),
    borderColor: z.string(),
    backgroundColor: z.string(),
    buttonBackgroundColor: z.string(),
    buttonBackgroundHoverColor: z.string(),
    buttonTextColor: z.string(),
    buttonTextHoverColor: z.string(),
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
