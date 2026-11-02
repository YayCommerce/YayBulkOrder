<?php
namespace YayBulkOrder\Engines;

defined( 'ABSPATH' ) || exit;

/**
 * Activate and deactive method of the plugin and relates.
 */
class ActDeact {

    public static function single_activate() {
    }

    public static function single_deactivate() {
        // Flush to reset
        flush_rewrite_rules();
        delete_option( 'ybo_flushed_rewrite' );
    }

    public static function single_uninstall() {
    }

    /**
     * Fired when the plugin is activated.
     *
     * @param bool $network_wide True if active in a multiste, false if classic site.
     */
    public static function activate( $network_wide ) {
        if ( function_exists( 'is_multisite' ) && is_multisite() ) {
            if ( $network_wide ) {
                // Get all blog ids
                /** @var array<\WP_Site> $blogs */
                $blogs = get_sites();

                foreach ( $blogs as $blog ) {
                    switch_to_blog( (int) $blog->blog_id );
                    self::single_activate();
                    restore_current_blog();
                }

                return;
            }
        }

        self::single_activate();
    }

    /**
     * Fired when the plugin is deactivated.
     *
     * @param bool $network_wide True if WPMU superadmin uses
     * "Network Deactivate" action, false if
     * WPMU is disabled or plugin is
     * deactivated on an individual blog.
     */
    public static function deactivate( $network_wide ) {
        if ( function_exists( 'is_multisite' ) && is_multisite() ) {
            if ( $network_wide ) {
                // Get all blog ids
                /** @var array<\WP_Site> $blogs */
                $blogs = get_sites();

                foreach ( $blogs as $blog ) {
                    switch_to_blog( (int) $blog->blog_id );
                    self::single_deactivate();
                    restore_current_blog();
                }

                return;
            }
        }

        self::single_deactivate();
    }

    /** Fired when the plugin is uninstalled. */
    public static function uninstall() {
        if ( function_exists( 'is_multisite' ) && is_multisite() ) {
                // Get all blog ids
                /** @var array<\WP_Site> $blogs */
                $blogs = get_sites();

            foreach ( $blogs as $blog ) {
                switch_to_blog( (int) $blog->blog_id );
                self::single_uninstall();
                restore_current_blog();
            }

            return;
        }

        self::single_uninstall();
    }
}
