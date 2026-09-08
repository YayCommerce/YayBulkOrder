<?php
namespace YayBulkOrder\Engines\Compatibles;

use YayBulkOrder\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Compatibility adapter for Cloudflare Rocket Loader.
 *
 * Rocket Loader predates ES Modules: it rewrites every <script> tag - module
 * or classic - replacing `type` with a meaningless placeholder so the browser
 * won't run it, then loads/executes it itself, asynchronously, on its own
 * schedule. For a Script Module (which power the Interactivity API - our
 * Product Table and WooCommerce's Mini Cart both use it) that breaks the
 * import graph's crossorigin/credentials expectations. For a classic script
 * like `wc-blocks-data-store` - which registers the `wc/store/cart` data
 * store our Cart Summary reads from - it just runs too late, after our
 * module has already checked for cart data and found none. Either way: no
 * console error, the module still "loads", but directives relying on that
 * data (bulk-action, back-to-top, cart summary) never react.
 *
 * Rocket Loader itself honors `data-cfasync="false"` on a <script> tag to
 * skip it entirely, but there's no core filter to add attributes to the
 * <script> tags WordPress prints for either script modules (see
 * WP_Script_Modules::print_script_module()) or classic scripts pointed at
 * our own/WooCommerce Blocks' handles, so this patches the buffered
 * <head>/<footer> markup instead.
 *
 * @method static RocketLoader get_instance()
 */
class RocketLoader {
    use SingletonTrait;

    /**
     * Substrings matched against a script tag (module or classic) to decide
     * whether it must be excluded from Rocket Loader.
     */
    private const EXCLUDED_PATH_NEEDLES = [
        'yay-bulk-order',
        '/plugins/woocommerce/assets/client/blocks/',
    ];

    protected function __construct() {
        if ( ! $this->site_is_behind_cloudflare() ) {
            return;
        }

        // Script modules print in wp_head (block themes) or wp_footer
        // (classic themes) - wrap both so this works regardless of theme.
        add_action( 'wp_head', [ $this, 'buffer_start' ], 0 );
        add_action( 'wp_head', [ $this, 'buffer_end' ], PHP_INT_MAX );
        add_action( 'wp_footer', [ $this, 'buffer_start' ], 0 );
        add_action( 'wp_footer', [ $this, 'buffer_end' ], PHP_INT_MAX );
    }

    /**
     * Whether Rocket Loader could plausibly be in play for this request.
     *
     * Rocket Loader is a Cloudflare dashboard toggle with no origin-visible
     * signal of its own - Cloudflare injects it into the response after it
     * leaves this server. The closest we can check from PHP is whether the
     * request was proxied through Cloudflare at all (the `CF-Ray` header,
     * added to every request Cloudflare forwards to the origin), which is a
     * necessary condition for Rocket Loader to matter. That keeps the output
     * buffering below off entirely for the vast majority of sites that don't
     * use Cloudflare.
     */
    private function site_is_behind_cloudflare(): bool {
        /**
         * Filters whether the Rocket Loader compatibility fix runs.
         *
         * Use this to force it on (e.g. Cloudflare sits behind another proxy
         * that strips `CF-Ray`) or off (e.g. Rocket Loader is confirmed
         * disabled despite the site being behind Cloudflare).
         *
         * @param bool|null $override Return a bool to force the decision, or null (default) to auto-detect.
         */
        $override = apply_filters( 'yaybulkorder_rocket_loader_compat_enabled', null );
        if ( null !== $override ) {
            return (bool) $override;
        }

        return isset( $_SERVER['HTTP_CF_RAY'] ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- only tested for presence, never output or compared.
    }

    public function buffer_start(): void {
        ob_start();
    }

    public function buffer_end(): void {
        $html = ob_get_clean();

        if ( ! is_string( $html ) || '' === $html ) {
            return;
        }

        echo $this->exclude_scripts_from_rocket_loader( $html ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- re-echoing WP's own already-escaped markup.
    }

    private function exclude_scripts_from_rocket_loader( string $html ): string {
        // Matches both module and classic <script> tags - `tag_needs_exclusion()`
        // only touches the ones matching our own needles, so widening this
        // doesn't affect any other script on the page.
        $needles = array_merge( self::EXCLUDED_PATH_NEEDLES, $this->get_classic_dependency_id_needles() );

        return (string) preg_replace_callback(
            '#<script\b[^>]*>#i',
            function ( array $matches ) use ( $needles ) {
                return $this->tag_needs_exclusion( $matches, $needles );
            },
            $html
        );
    }

    /**
     * `id="{handle}-js` needles (deliberately missing the closing quote, so
     * it also matches WordPress's inline "before"/"after" companion tag,
     * printed as `id="{handle}-js-before"` / `-after"`) for every classic
     * script that a script matching our path needles (e.g.
     * `wc-blocks-data-store`) transitively depends on - `wp-hooks`,
     * `wp-api-fetch`, `wp-notices`, etc.
     *
     * The inline companion matters just as much as the script itself: e.g.
     * `wc-blocks-middleware-js-before` defines `wcBlocksMiddlewareConfig`,
     * which `wc-blocks-middleware.js` reads as soon as it runs. Leaving that
     * inline tag for Rocket Loader to defer while its sibling script now
     * runs natively (early) throws `wcBlocksMiddlewareConfig is not
     * defined` - the same "excluded the runner, not what it reads" mistake
     * as the dependency-chain fix above, just one tag closer.
     *
     * Those dependencies live under wp-includes/, so they never match our
     * path needles themselves. Excluding only the scripts that DO match
     * would let Rocket Loader keep deferring their dependencies, so the
     * excluded script now runs natively (early, in document order) while
     * `window.wp.hooks`/`wp.apiFetch`/`wp.notices` etc. are still undefined
     * - swapping "runs too late" for "throws immediately". Walking WP's own
     * dependency graph (rather than guessing more paths) is what actually
     * keeps the whole chain in a consistent, correct load order.
     *
     * Only applies to classic scripts (`wp_scripts()`) - Script Modules
     * resolve their own graph via native `import`, so they aren't affected
     * by this and stay covered by the path needles alone.
     */
    private function get_classic_dependency_id_needles(): array {
        if ( ! function_exists( 'wp_scripts' ) ) {
            return [];
        }

        $registered = wp_scripts()->registered ?? [];

        // Seed from every REGISTERED script whose own src matches our path
        // needles - not $done (only what's been printed so far). A script
        // like `wc-blocks-data-store` is registered upfront but only ends up
        // in $done once WordPress actually reaches it in the footer, while
        // some of its own dependencies (e.g. `wp-hooks`, `wp-i18n`) print
        // earlier, in the head, for unrelated reasons. Seeding from $done
        // would compute an empty/incomplete needle list on wp_head (nothing
        // matched yet) and only get it right once it's too late, in
        // wp_footer, after those head tags already printed unprotected.
        // Registered scripts don't change mid-request, so this gives the
        // same, complete answer whether it runs in wp_head or wp_footer.
        $queue = [];
        foreach ( $registered as $handle => $dependency ) {
            $src = (string) ( $dependency->src ?? '' );
            foreach ( self::EXCLUDED_PATH_NEEDLES as $needle ) {
                if ( false !== stripos( $src, $needle ) ) {
                    $queue[] = $handle;
                    break;
                }
            }
        }

        // Walk their dependency chains.
        $excluded = [];
        while ( [] !== $queue ) {
            $handle = array_pop( $queue );
            if ( isset( $excluded[ $handle ] ) || ! isset( $registered[ $handle ] ) ) {
                continue;
            }

            $excluded[ $handle ] = true;
            foreach ( (array) $registered[ $handle ]->deps as $dep ) {
                $queue[] = $dep;
            }
        }

        return array_map(
            static fn ( string $handle ) => 'id="' . $handle . '-js',
            // No closing quote - see docblock.
            array_keys( $excluded )
        );
    }

    private function tag_needs_exclusion( array $matches, array $needles ): string {
        $tag = $matches[0];

        if ( false !== stripos( $tag, 'data-cfasync' ) ) {
            return $tag;
        }

        foreach ( $needles as $needle ) {
            if ( false !== stripos( $tag, $needle ) ) {
                return str_ireplace( '<script', '<script data-cfasync="false"', $tag );
            }
        }

        return $tag;
    }
}
