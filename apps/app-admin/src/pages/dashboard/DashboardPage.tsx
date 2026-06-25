import { __ } from '@wordpress/i18n';

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex flex-col items-start gap-x-4 gap-y-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{__('Dashboard', 'yay-bulk-order')}</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4 2xl:gap-6">
        <div>TopWholesaleCustomers</div>
        <div>TopProducts</div>
      </div>
    </div>
  );
}
