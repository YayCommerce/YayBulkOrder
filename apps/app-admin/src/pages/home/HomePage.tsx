import { Separator } from '@/components/ui/separator';
import Features from '@/pages/home/Features/Features';
import QuickStart from '@/pages/home/QuickStart';

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 2xl:gap-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <QuickStart />
          <Separator />
          <Features />
        </div>

        {/* <div className="flex w-full flex-col gap-4 lg:w-60 lg:shrink-0">
          <Card>
            <CardTitle className="text-sm">{__('Works Best With', 'yay-bulk-order')}</CardTitle>

            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-medium">{__('Brandy Theme', 'yay-bulk-order')}</CardTitle>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <CardTitle className="text-sm font-medium">{__('Brandy Block Library', 'yay-bulk-order')}</CardTitle>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="text-sm">{__('Free vs Pro', 'yay-bulk-order')}</CardTitle>
            <Button variant="outline" className="w-full">
              {__('Compare Table', 'yay-bulk-order')}
            </Button>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
