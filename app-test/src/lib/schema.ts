import { z } from 'zod';

const stringifyValue = z.coerce.string();

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  price: stringifyValue,
  regular_price: stringifyValue,
  sale_price: stringifyValue,
  image: z.string(),
  permalink: z.string(),
  stock_status: z.string(),
  in_stock: z.boolean(),
  sku: z.string(),
});

const productParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sortField: z.string().optional(),
  sortVal: z.enum(['ascending', 'descending']).optional(),
  stock_status: z.enum(['all', 'in_stock', 'out_of_stock']).optional(),
});

const productResponseSchema = z.object({
  data: z.array(productSchema),
  totalItem: z.number(),
  totalPage: z.number(),
});

const addToCartResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  cart_count: z.number().optional(),
});

export type Product = z.infer<typeof productSchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
export type AddToCartResponse = z.infer<typeof addToCartResponseSchema>;

export { productSchema, productParamsSchema, productResponseSchema, addToCartResponseSchema };

