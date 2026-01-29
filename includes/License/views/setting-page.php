<?php

	use YayBulkOrder\License\LicensingPlugin;
	use YayBulkOrder\License\CorePlugin;

	defined( 'ABSPATH' ) || exit;

	$licensing_plugins = $this->get_licensing_plugins();
?>
<div class="yaycommerce-license-wrap">
	<div id="yaycommerce-license-root">
		<div class="yaycommerce-license-layout">
			<div class="yaycommerce-license-layout-primary">
				<div class="yaycommerce-license-layout-main">
					<div class="yaycommerce-license-settings">
						<?php
						foreach ( $licensing_plugins as $_plugin ) {
							$licensing_plugin = new LicensingPlugin( $_plugin['slug'] );
							$license          = $licensing_plugin->get_license();
							if ( $license->is_active() ) {
								require CorePlugin::get( 'path' ) . 'views/license/information-card.php';
							} else {
								require CorePlugin::get( 'path' ) . 'views/license/activate-card.php';
							}
						}
						do_action( 'yaycommerce_bulk_order_plugins' );
						?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
