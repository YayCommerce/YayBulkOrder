import z from 'zod';
import { __ } from '@wordpress/i18n';

export const columnSchema = z.enum([
  'yay-bulk-order/column-product-title',
  'yay-bulk-order/column-product-price',
  'yay-bulk-order/column-product-stock',
  'yay-bulk-order/column-add-to-cart',
]);

export const shortcodeSchema = z.object({
  id: z.number(),
  title: z.string().min(1, { message: __('Title is required', 'yay-bulk-order') }),
  pattern: z.enum(['simple', 'filterable']),
  columns: z.array(columnSchema),
});

export const createShortcodeSchema = shortcodeSchema.omit({ id: true });

export const paginatedShortcodeSchema = z.object({
  currentPage: z.number(),
  totalPage: z.number(),
  data: z.array(shortcodeSchema),
});

export type ShortcodeFormValues = z.infer<typeof shortcodeSchema>;
export type CreateShortcodeValues = z.infer<typeof createShortcodeSchema>;

export type PaginatedShortcodeListValues = z.infer<typeof paginatedShortcodeSchema>;
