<?php
namespace YayBulkOrder\Test\Api;

defined( 'ABSPATH' ) || exit;

/**
 * Products REST API
 */
class ProductsAPI {
	protected static $instance = null;

	public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		register_rest_route(
			'yay-bulk-order/v1',
			'/products',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_products' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'page' => array(
						'default'           => 1,
						'sanitize_callback' => 'absint',
					),
					'limit' => array(
						'default'           => 10,
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * Get products
	 */
	public function get_products( $request ) {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return new \WP_Error(
				'woocommerce_not_active',
				__( 'WooCommerce is not active.', 'yay-bulk-order' ),
				array( 'status' => 400 )
			);
		}

		$page = $request->get_param( 'page' );
		$page = $page ? absint( $page ) : 1;
		
		$limit = $request->get_param( 'limit' );
		$limit = $limit ? absint( $limit ) : 10;
		
		$offset = ( $page - 1 ) * $limit;

		// Get total count of published products using direct database query for optimal performance
		global $wpdb;
		$total_items = (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(DISTINCT ID) FROM {$wpdb->posts} 
				WHERE post_type = %s AND post_status = %s",
				'product',
				'publish'
			)
		);
		$total_pages = ceil( $total_items / $limit );

		// Get paginated products
		$products = wc_get_products(
			array(
				'limit'  => $limit,
				'offset' => $offset,
				'status' => 'publish',
			)
		);

		$formatted_products = array();

		foreach ( $products as $product ) {
			$formatted_products[] = array(
				'id'          => $product->get_id(),
				'name'        => $product->get_name(),
				'slug'        => $product->get_slug(),
				'price'       => $product->get_price(),
				'regular_price' => $product->get_regular_price(),
				'sale_price'  => $product->get_sale_price(),
				'image'       => wp_get_attachment_image_url( $product->get_image_id(), 'medium' ),
				'permalink'  => $product->get_permalink(),
				'stock_status' => $product->get_stock_status(),
				'in_stock'   => $product->is_in_stock(),
				'sku'        => $product->get_sku(),
			);
		}

		// Return response with pagination data
		$response_data = array(
			'products' => $formatted_products,
			'pagination' => array(
				'total_items' => $total_items,
				'total_pages' => $total_pages,
				'current_page' => $page,
				'items_per_page' => $limit,
			),
		);
		
		$response = rest_ensure_response( $response_data );
		
		// Add pagination headers
		$response->header( 'X-WP-Total', $total_items );
		$response->header( 'X-WP-TotalPages', $total_pages );
		
		return $response;
	}
}

