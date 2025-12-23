export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  image: string;
  permalink: string;
  stock_status: string;
  in_stock: boolean;
  sku: string;
}

export interface ProductParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortVal?: 'ascending' | 'descending';
  stock_status?: 'all' | 'in_stock' | 'out_of_stock';
}

export interface ProductResponse {
  data: Product[];
  totalItem: number;
  totalPage: number;
}

export const getProducts = async (params: ProductParams = {}): Promise<ProductResponse> => {
  const wpData = (window as any).yayBulkOrderWpData;
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sortField) {
    queryParams.append('orderby', params.sortField);
    queryParams.append('order', params.sortVal === 'descending' ? 'desc' : 'asc');
  }
  if (params.stock_status && params.stock_status !== 'all') {
    queryParams.append('stock_status', params.stock_status);
  }

  const response = await fetch(`${wpData.restUrl}products?${queryParams.toString()}`, {
    headers: {
      'X-WP-Nonce': wpData.nonce,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  
  // Handle new API response structure with products and pagination
  const productsArray = data.products || [];
  
  // Transform products array to match our interface
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

  // Get pagination data from response body or headers as fallback
  const totalPages = data.pagination?.total_pages || parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
  const totalItem = data.pagination?.total_items || parseInt(response.headers.get('X-WP-Total') || products.length.toString(), 10);

  return {
    data: products,
    totalItem,
    totalPage: totalPages,
  };
};

