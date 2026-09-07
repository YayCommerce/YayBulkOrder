import { z } from 'zod';
import { __ } from '@wordpress/i18n';

export const productTableColumnSchema = z.object({
  slug: z.enum(['product', 'sku', 'description', 'quantity', 'subtotal', 'add-to-cart']),
  enabled: z.boolean(),
  heading: z
    .string()
    .min(1, __('Fill in the field label', 'yay-wholesale-b2b'))
    .regex(
      /^[\p{L}0-9 _\-&:/]+$/u,
      __(
        'Heading can only contain letters, numbers, spaces, and common symbols (-, _, &, :, /.).',
        'yay-wholesale-b2b',
      ),
    ),
  responsive: z.enum(['always-show', 'hide-on-mobile', 'hide-on-tablet']),
});

const productTableQuerySchema = z
  .object({
    queryBy: z.enum(['all-products', 'by-categories', 'featured', 'on-sale', 'top-rated', 'hand-picked']),
    categories: z.array(z.number()).optional(),
    products: z.array(z.number()).optional(),
  })
  .refine((query) => query.queryBy !== 'by-categories' || (query.categories?.length ?? 0) > 0, {
    message: __('Select at least one category', 'yay-bulk-order'),
    path: ['categories'],
  })
  .refine((query) => query.queryBy !== 'hand-picked' || (query.products?.length ?? 0) > 0, {
    message: __('Select at least one product', 'yay-bulk-order'),
    path: ['products'],
  });

export const productTableSchema = z.object({
  title: z.string().optional(),
  query: productTableQuerySchema,
  columns: z.array(productTableColumnSchema),
  features: z.object({
    hasFilter: z.boolean(),
    hasSearch: z.boolean(),
    hasPagination: z.boolean(),
    pageSize: z.number().optional(),
  }),
});

export const prebuildTemplateSchema = z.object({
  slug: z.string(),
  title: z.string(),
  desc: z.string(),
  data: productTableSchema,
});

export type ProductTableColumn = z.infer<typeof productTableColumnSchema>;
export type ProductTableForm = z.infer<typeof productTableSchema>;
export type ProductTable = z.infer<typeof productTableSchema> & { id: number };
export type TablePrebuildTemplate = z.infer<typeof prebuildTemplateSchema>;

export type ProductTableListParams = {
  page: number;
  perPage: number;
  search: string;
  productsDisplay: 'all-tables' | ProductTable['query']['queryBy'];
};
export type PaginatedProductTables = {
  currentPage: number;
  totalPage: number;
  totalItems: number;
  data: ProductTable[];
};
