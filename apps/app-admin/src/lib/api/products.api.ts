import { wooCommerceApi } from '@/lib/api/api';

export const PRODUCTS_PER_PAGE = 100;

export type Product = {
  id: number;
  name: string;
  image: string;
};

export type ProductsPage = {
  products: Product[];
  page: number;
  totalPages: number;
};

type WooProduct = { id: number; name: string; images?: Array<{ src?: string }> };

/** Fetch a single page of published products from the WooCommerce REST base. */
export async function getProductsPage(page: number): Promise<ProductsPage> {
  const searchParams = new URLSearchParams({
    page: String(page),
    per_page: String(PRODUCTS_PER_PAGE),
    status: 'publish',
    orderby: 'title',
    order: 'asc',
    _fields: 'id,name,images',
  });

  const response = await wooCommerceApi.get('products', { searchParams });
  const products: Product[] = ((await response.json()) as WooProduct[]).map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.src ?? '',
  }));

  return { products, page, totalPages: Number(response.headers.get('x-wp-totalpages')) || 1 };
}
