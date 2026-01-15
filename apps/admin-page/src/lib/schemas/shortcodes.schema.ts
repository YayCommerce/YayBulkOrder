import z from 'zod';

export const shortcodeSchema = z.object({
  id: z.number(),
  title: z.string(),
  order: z.number(),
});

export const paginatedShortcodeSchema = z.object({
  currentPage: z.number(),
  totalPage: z.number(),
  data: z.array(shortcodeSchema),
});

export type ShortcodeFormValues = z.infer<typeof shortcodeSchema>;

export type PaginatedShortcodeListValues = z.infer<typeof paginatedShortcodeSchema>;
