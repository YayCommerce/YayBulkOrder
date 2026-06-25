import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h2 className="text-foreground mb-2 text-xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground text-sm">Looks like this page has gone missing</p>
      </div>

      <Button variant="primary" onClick={() => navigate('/home')}>
        {__('Back to home', 'yay-bulk-order')}
      </Button>
    </div>
  );
}
