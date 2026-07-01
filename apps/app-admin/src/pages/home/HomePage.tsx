import { NavLink } from 'react-router';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex flex-col items-start gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{__('Home', 'yay-bulk-order')}</h1>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="mb-2 text-sm">Start Build your Product Tables</p>
          <Button asChild>
            <NavLink to="/product-tables">Start Now</NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
