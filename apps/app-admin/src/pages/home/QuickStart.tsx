import { TooltipTrigger } from '@radix-ui/react-tooltip';
import { ArrowRight, LayoutGrid, Table2 } from 'lucide-react';
import { NavLink } from 'react-router';
import { __ } from '@wordpress/i18n';

import { patternLibraryUrl } from '@/lib/helpers/wp.helper';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent } from '@/components/ui/tooltip';

const { isBlockTheme } = window.yayBulkOrderMeta.wpMeta;

export default function QuickStart() {
  const openPatterns = () => window.open(patternLibraryUrl(), '_blank', 'noopener');
  return (
    <div className="grid gap-3">
      <div>
        <h2 className="font-semibold">{__('Quick Start', 'yay-bulk-order')}</h2>
        <p className="text-muted-foreground text-sm">
          {__("Enhance your customers' bulk order experience.", 'yay-bulk-order')}{' '}
          <button type="button" className="text-primary hover:underline">
            {__('Learn more…', 'yay-bulk-order')}
          </button>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="bg-primary/6 text-primary flex size-10 items-center justify-center rounded-md">
            <LayoutGrid className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm">{__('Start with Pre-designed Patterns', 'yay-bulk-order')}</CardTitle>
            <CardDescription className="mt-1">
              {__(
                'Instantly apply a ready-made layout to your bulk order features with zero configuration.',
                'yay-bulk-order',
              )}
            </CardDescription>
          </div>
          {isBlockTheme ? (
            <Button className="w-fit" onClick={openPatterns}>
              {__('Browse Patterns', 'yay-bulk-order')}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-fit" onClick={openPatterns}>
                  {__('Browse Patterns', 'yay-bulk-order')}
                  <ArrowRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex flex-col gap-2 text-left">
                <p className="mb-2 font-semibold">
                  {__("Your theme doesn't support full Pattern customization.", 'yay-bulk-order')}
                </p>
                <p className="text-[12px]">
                  {__(
                    'For the best experience, we recommend the Brandy theme for fully customizable Yay Bulk Order Patterns.',
                    'yay-bulk-order',
                  )}
                </p>
                <p className="text-[12px]">
                  {__(
                    'Using a Classic Theme? Yay Bulk Order still supports Shortcodes and Classic Settings.',
                    'yay-bulk-order',
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </Card>

        <Card>
          <div className="bg-primary/6 text-primary flex size-10 items-center justify-center rounded-md">
            <Table2 className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm">{__('Build Your Own Product Table', 'yay-bulk-order')}</CardTitle>
            <CardDescription className="mt-1">
              {__(
                'Use the drag-and-drop builder to create a fully custom product table from scratch.',
                'yay-bulk-order',
              )}
            </CardDescription>
          </div>
          <Button variant="outline" className="w-fit" asChild>
            <NavLink to="/product-tables">
              {__('Open Builder', 'yay-bulk-order')}
              <ArrowRight className="size-4" />
            </NavLink>
          </Button>
        </Card>
      </div>
    </div>
  );
}
