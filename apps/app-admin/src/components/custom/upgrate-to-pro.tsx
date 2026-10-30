import { ChevronRight } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { assetUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { HelpTip } from '@/components/ui/tooltip';

const yayBulkOrderUrl = 'https://yaycommerce.com/';

export function UpgradeToProBadge() {
  return (
    <HelpTip
      trigger={
        <Badge
          variant="warning"
          className="text-3 h-4.5 pr-0.75 cursor-pointer rounded-sm p-1.5 leading-6 text-white"
          onClick={() => {
            window.open(yayBulkOrderUrl);
          }}
        >
          {__('Pro', 'yay-bulk-order')}
          <ChevronRight className="h-0.75 w-1.25" />
        </Badge>
      }
      content={__('Unlock this feature', 'yay-bulk-order')}
    />
  );
}

export function UpgradeToProButton() {
  return (
    <Button
      variant="warning"
      size="sm"
      className="cursor-pointer font-semibold leading-6 text-white"
      onClick={() => {
        window.open(yayBulkOrderUrl);
      }}
    >
      {__('Upgrade To Pro', 'yay-bulk-order')}
      <ChevronRight className="h-0.75 w-1.25" />
    </Button>
  );
}

export function UpgradeToProOverlay() {
  return (
    <Empty className="my-5">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-15 bg-[#FFF5DB]">
          <img src={assetUrl('images/YayBulkOrder.svg')} alt="YayBulkOrder" className="size-13" />
        </EmptyMedia>
        <EmptyTitle className="flex items-center gap-1.5 font-bold">
          {__('Yay Bulk Order', 'yay-bulk-order')}
          <Badge variant="warning" className="text-white">
            {__('Pro', 'yay-bulk-order')}
          </Badge>
        </EmptyTitle>
        <EmptyDescription>{__('Upgrade to PRO to unlock this feature now', 'yay-bulk-order')}</EmptyDescription>
        <EmptyContent>
          <Button
            variant="warning"
            className="text-white"
            onClick={() => {
              window.open(yayBulkOrderUrl);
            }}
          >
            {__('Upgrade', 'yay-bulk-order')}
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
