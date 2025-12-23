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

		register_rest_route(
			'yay-bulk-order/v1',
			'/cart/add',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'add_to_cart' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'product_id' => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
						'validate_callback' => function( $param ) {
							return is_numeric( $param ) && $param > 0;
						},
					),
					'quantity' => array(
						'default'           => 1,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
						'validate_callback' => function( $param ) {
							return is_numeric( $param ) && $param > 0;
						},
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

	/**
	 * Add product to cart
	 */
	public function add_to_cart( $request ) {
		if ( ! function_exists( 'WC' ) ) {
			return new \WP_Error(
				'woocommerce_not_active',
				__( 'WooCommerce is not active.', 'yay-bulk-order' ),
				array( 'status' => 400 )
			);
		}

		if ( ! WC()->cart ) {
			wc_load_cart();
		}

		if ( ! WC()->cart ) {
			return new \WP_Error(
				'cart_not_available',
				__( 'Cart is not available.', 'yay-bulk-order' ),
				array( 'status' => 500 )
			);
		}

		$product_id = $request->get_param( 'product_id' );
		$quantity   = $request->get_param( 'quantity' ) ? absint( $request->get_param( 'quantity' ) ) : 1;

		// Validate product exists
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return new \WP_Error(
				'product_not_found',
				__( 'Product not found.', 'yay-bulk-order' ),
				array( 'status' => 404 )
			);
		}

		// Check if product is purchasable
		if ( ! $product->is_purchasable() ) {
			return new \WP_Error(
				'product_not_purchasable',
				__( 'Product is not purchasable.', 'yay-bulk-order' ),
				array( 'status' => 400 )
			);
		}

		// Check stock status
		if ( ! $product->is_in_stock() ) {
			return new \WP_Error(
				'product_out_of_stock',
				__( 'Product is out of stock.', 'yay-bulk-order' ),
				array( 'status' => 400 )
			);
		}

		// Check if quantity exceeds stock
		if ( $product->managing_stock() && $quantity > $product->get_stock_quantity() ) {
			return new \WP_Error(
				'quantity_exceeds_stock',
				__( 'Quantity exceeds available stock.', 'yay-bulk-order' ),
				array( 'status' => 400 )
			);
		}

		// Add to cart
		$cart_item_key = WC()->cart->add_to_cart( $product_id, $quantity );

		if ( ! $cart_item_key ) {
			return new \WP_Error(
				'add_to_cart_failed',
				__( 'Failed to add product to cart.', 'yay-bulk-order' ),
				array( 'status' => 500 )
			);
		}

		// Return success response
		$response_data = array(
			'success'    => true,
			'message'    => sprintf(
				/* translators: %s: Product name */
				__( '"%s" has been added to your cart.', 'yay-bulk-order' ),
				$product->get_name()
			),
			'cart_count' => WC()->cart->get_cart_contents_count(),
		);

		return rest_ensure_response( $response_data );
	}
}

