import { __ } from '@wordpress/i18n';

import FeatureCard from '@/pages/home/Features/FeatureCard';

export default function Features() {
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="font-semibold">{__('Features', 'yay-bulk-order')}</h2>
        <p className="text-muted-foreground text-sm">
          {__('Everything you need to create a seamless bulk ordering experience.', 'yay-bulk-order')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FeatureCard
          slug="product-table"
          title={__('Product Table', 'yay-bulk-order')}
          description={__(
            'Display products in a clean, scannable table so customers can browse and add items to cart in bulk. The foundation of every bulk order experience.',
            'yay-bulk-order',
          )}
          linkLabel={__('Patterns', 'yay-bulk-order')}
          type="pattern"
          isProFeature={false}
        />
        <FeatureCard
          slug="variant-table"
          title={__('Variant Table', 'yay-bulk-order')}
          description={__(
            'Let customers select product variants directly in the table without navigating to individual product pages. Speeds up ordering for stores with many SKUs.',
            'yay-bulk-order',
          )}
          linkLabel={__('Patterns', 'yay-bulk-order')}
          type="pattern"
          isProFeature={true}
        />
        <FeatureCard
          slug="purchase-list"
          title={__('Purchase List', 'yay-bulk-order')}
          description={__(
            'Save frequently ordered items into named lists for one-click re-ordering. Perfect for B2B customers with recurring orders.',
            'yay-bulk-order',
          )}
          linkLabel={__('Patterns', 'yay-bulk-order')}
          type="pattern"
          isProFeature={true}
        />
        <FeatureCard
          slug="shop"
          title={__('Shop / Category Page', 'yay-bulk-order')}
          description={__(
            'Embed the bulk order table directly on your shop or category pages so customers never have to leave the browse experience to place an order.',
            'yay-bulk-order',
          )}
          linkLabel={__('Template', 'yay-bulk-order')}
          type="template"
          isProFeature={false}
        />
      </div>
    </div>
  );
}
