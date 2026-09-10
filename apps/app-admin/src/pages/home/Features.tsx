import { ExternalLink } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { patternLibraryUrl } from '@/lib/helpers/wp.helper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const { isBlockTheme } = window.yayBulkOrderMeta.wpMeta;

type Feature = {
  title: string;
  badge?: boolean;
  description: string;
  linkLabel: string;
  type: 'pattern' | 'template';
};

const FEATURES: Feature[] = [
  {
    title: __('Product Table', 'yay-bulk-order'),
    description: __(
      'Display products in a clean, scannable table so customers can browse and add items to cart in bulk. The foundation of every bulk order experience.',
      'yay-bulk-order',
    ),
    linkLabel: __('Patterns', 'yay-bulk-order'),
    type: 'pattern',
  },
  {
    title: __('Variant Table', 'yay-bulk-order'),
    badge: true,
    description: __(
      'Let customers select product variants directly in the table without navigating to individual product pages. Speeds up ordering for stores with many SKUs.',
      'yay-bulk-order',
    ),
    linkLabel: __('Patterns', 'yay-bulk-order'),
    type: 'pattern',
  },
  {
    title: __('Purchase List', 'yay-bulk-order'),
    badge: true,
    description: __(
      'Save frequently ordered items into named lists for one-click re-ordering. Perfect for B2B customers with recurring orders.',
      'yay-bulk-order',
    ),
    linkLabel: __('Patterns', 'yay-bulk-order'),
    type: 'pattern',
  },
  {
    title: __('Shop / Category Page', 'yay-bulk-order'),
    description: __(
      'Embed the bulk order table directly on your shop or category pages so customers never have to leave the browse experience to place an order.',
      'yay-bulk-order',
    ),
    linkLabel: __('Template', 'yay-bulk-order'),
    type: 'template',
  },
];

export default function Features() {
  const linkTo = (type: 'pattern' | 'template', key: string) => {
    if (isBlockTheme) {
      if (type === 'pattern') {
        window.open(patternLibraryUrl(key), '_blank', 'noopener');
      }
    }
  };

  return (
    <div className="grid gap-3">
      <div>
        <h2 className="font-semibold">{__('Features', 'yay-bulk-order')}</h2>
        <p className="text-muted-foreground text-sm">
          {__('Everything you need to create a seamless bulk ordering experience.', 'yay-bulk-order')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map(({ title, badge, description, linkLabel, type }) => (
          <Card key={title} className="gap-1">
            <CardHeader>
              <CardTitle className="text-sm">{title}</CardTitle>
              {badge && (
                <CardAction>
                  <Badge variant="success-soft">{__('Enabled', 'yay-bulk-order')}</Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="text-muted-foreground flex-1 text-xs">{description}</CardContent>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <Button variant="link" className="p-0! h-fit text-xs font-normal no-underline hover:no-underline">
                {__('Demo', 'yay-bulk-order')}
                <ExternalLink className="size-3" />
              </Button>
              <Separator orientation="vertical" className="bg-muted-foreground" />
              {isBlockTheme ? (
                <Button
                  variant="link"
                  onClick={() => linkTo(type ?? 'pattern', title)}
                  className="p-0! h-fit text-xs font-normal no-underline hover:no-underline"
                >
                  {linkLabel}
                  <ExternalLink className="size-3" />
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex h-fit cursor-default items-center gap-1 text-xs">
                      {linkLabel}
                      <ExternalLink className="size-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="flex flex-col gap-2 text-left">
                    <p className="mb-2 font-semibold">
                      {__("Your theme doesn't support full customization.", 'yay-bulk-order')}
                    </p>
                    <p className="text-[12px]">
                      {__(
                        'For the best experience, we recommend the Brandy theme for fully customizable Yay Bulk Order Patterns and Templates.',
                        'yay-bulk-order',
                      )}
                    </p>
                    <p className="text-[12px]">
                      {__(
                        'Note: Yay Bulk Order still supports Shortcodes and Classic Settings for Classic theme.',
                        'yay-bulk-order',
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
