<?php
namespace YayBulkOrder\Controllers;

use WP_REST_Request;
use WP_REST_Response;

defined( 'ABSPATH' ) || exit;

/**
 * Class BaseRestController
 *
 * Provides common methods for REST controllers.
 */
abstract class BaseRestController {

    public const REST_NAMESPACE = 'yay-bulk-order/v1';

    /**
     * Return an error response.
     *
     * @param string $message The error message.
     * @param string $code The error code.
     * @param int    $status The HTTP status code.
     * @return WP_REST_Response The response object.
     */
    protected function error( string $message, string $code = 'invalid_request', int $status = 400 ): WP_REST_Response {
        return rest_ensure_response( new \WP_Error( $code, $message, [ 'status' => $status ] ) );
    }

    /**
     * Get the JSON parameters from the request.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The JSON parameters.
     */
    protected function get_json_params( WP_REST_Request $request ): array {
        return (array) $request->get_json_params();
    }

    /**
     * Get the form data from the request.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The form data.
     */
    protected function get_body_params( WP_REST_Request $request ): array {
        return (array) $request->get_body_params();
    }
}
