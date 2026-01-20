import { __ } from '@wordpress/i18n';
import z from 'zod';

export const shortcodeSchema = z.object({
  id: z.number(),
  title: z.string().min(1, { message: __('Title is required', 'yay-bulk-order') }),
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
