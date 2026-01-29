import z from 'zod';
import { __ } from '@wordpress/i18n';

const columnSchema = z.enum([
  'yay-bulk-order/column-product-title',
  'yay-bulk-order/column-product-price',
  'yay-bulk-order/column-product-stock',
  'yay-bulk-order/column-add-to-cart',
]);

const shortcodeConfigSchema = z.object({
  id: z.number(),
  title: z.string().min(1, __('Title is required', 'yay-bulk-order')),
  pattern: z.enum(['simple', 'filterable']),
  columns: z.array(columnSchema),
});

export const shortcodeConfigFormSchema = shortcodeConfigSchema.omit({ id: true });

export type ShortcodeConfig = z.infer<typeof shortcodeConfigSchema>;
export type ShortcodeConfigFormValues = z.infer<typeof shortcodeConfigFormSchema>;
