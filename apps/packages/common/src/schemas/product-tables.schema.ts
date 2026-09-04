import { z } from 'zod';

export const productTableColumnSchema = z.object({
  slug: z.enum(['product', 'sku', 'description', 'quantity', 'subtotal', 'summary', 'add-to-cart']),
  enabled: z.boolean(),
  heading: z.string(),
  responsive: z.enum(['always-show', 'hide-on-mobile', 'hide-on-tablet']),
});

export const productTableSchema = z.object({
  title: z.string().optional(),
  query: z.object({
    queryBy: z.enum(['all', 'categories', 'featured', 'sale']),
    categories: z.array(z.string()).optional(),
  }),
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
