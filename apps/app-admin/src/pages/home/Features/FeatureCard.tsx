import { ExternalLink } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { archiveProductTemplateUrl, patternLibraryUrl } from '@/lib/helpers/wp.helper';
import { isPro } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UpgradeToProBadge } from '@/components/custom/upgrate-to-pro';

const { isBlockTheme } = window.yayBulkOrderMeta.wpMeta;

type Feature = {
  slug: string;
  title: string;
  description: string;
  linkLabel: string;
  type: 'pattern' | 'template';
  isProFeature: boolean;
};

export default function FeatureCard({ slug, title, description, linkLabel, type, isProFeature }: Feature) {
  const linkToPatternTemplate = () => {
    if (!isBlockTheme) {
      return;
    }

    if (type === 'pattern') {
      window.open(patternLibraryUrl(title), '_blank', 'noopener');
      return;
    }

    if (slug === 'shop') {
      const url = archiveProductTemplateUrl();
      if (url) {
        window.open(url, '_blank', 'noopener');
        return;
      }
    }
  };
  return (
    <Card className="gap-1">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        {isProFeature &&
          (isPro ? (
            <CardAction>
              <Badge variant="success-soft">{__('Enabled', 'yay-bulk-order')}</Badge>
            </CardAction>
          ) : (
            <UpgradeToProBadge />
          ))}
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
            onClick={() => linkToPatternTemplate()}
            className="p-0! h-fit text-xs font-normal no-underline hover:no-underline"
            disabled={!isPro && isProFeature}
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
  );
}
