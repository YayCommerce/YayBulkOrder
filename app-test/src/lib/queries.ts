import { api } from './api';
import { productSchema, productResponseSchema, addToCartResponseSchema, type Product, type ProductParams, type ProductResponse, type AddToCartResponse } from './schema';

export const getProducts = async (params: ProductParams = {}): Promise<ProductResponse> => {
  const queryParams: Record<string, string> = {};

  if (params.page) queryParams.page = params.page.toString();
  if (params.limit) queryParams.limit = params.limit.toString();
  if (params.search) queryParams.search = params.search;
  if (params.sortField) {
    queryParams.orderby = params.sortField;
    queryParams.order = params.sortVal === 'descending' ? 'desc' : 'asc';
  }
  if (params.stock_status && params.stock_status !== 'all') {
    queryParams.stock_status = params.stock_status;
  }

  const response = await api.get('products', {
    searchParams: queryParams,
  });

  const data = await response.json() as any;
  
  // Handle new API response structure with products and pagination
  const productsArray = data.products || [];
  
  // Transform products array to match our schema
  const products: Product[] = productsArray.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price || '0',
    regular_price: item.regular_price || item.price || '0',
    sale_price: item.sale_price || item.price || '0',
    image: item.image || '',
    permalink: item.permalink || '',
    stock_status: item.stock_status || 'instock',
    in_stock: item.in_stock !== undefined ? item.in_stock : item.stock_status === 'instock',
    sku: item.sku || '',
  }));

  // Validate and parse products
  const validatedProducts = products.map(product => productSchema.parse(product));

  // Get pagination data from response body or headers as fallback
  const totalPages = data.pagination?.total_pages || parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
  const totalItem = data.pagination?.total_items || parseInt(response.headers.get('X-WP-Total') || products.length.toString(), 10);

  // Validate and parse response
  const responseData = productResponseSchema.parse({
    data: validatedProducts,
    totalItem,
    totalPage: totalPages,
  });

  return responseData;
};

export const addToCart = async (
  productId: number,
  quantity: number = 1
): Promise<AddToCartResponse> => {
  try {
    const response = await api.post('cart/add', {
      json: {
        product_id: productId,
        quantity: quantity,
      },
    });

    const data = await response.json();
    return addToCartResponseSchema.parse(data);
  } catch (error: any) {
    const errorMessage = error?.response?.json ? (await error.response.json()).message : 'Failed to add to cart';
    throw new Error(errorMessage || 'Failed to add to cart');
  }
};

