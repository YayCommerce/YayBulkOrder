import { Link, useParams } from 'react-router';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface Tab {
  path: string;
  label: string;
  component: React.ReactNode;
}

export default function SettingsSidebar({ tabs }: { tabs: Tab[] }) {
  const { subMenu } = useParams();
  return (
    <div className="shrink-0 sm:w-[176px]">
      <Card className="m-0 rounded-lg border-none bg-transparent p-0 shadow-none">
        <CardContent className="w-full overflow-x-auto px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex h-fit w-full items-center gap-1 bg-transparent p-0 sm:flex-col sm:items-stretch">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={`/settings/${tab.path}`}
                className={cn(
                  'text-foreground-400 justify-start rounded-none border-none p-4 py-2.5 text-left text-sm font-normal text-nowrap ring-0 outline-none focus:ring-0 focus:outline-none sm:text-wrap',
                  'hover:text-primary hover:rounded-md hover:bg-white',
                  tab.path === subMenu &&
                    'text-primary rounded-md bg-white font-medium shadow-none',
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
