import { useNavigate, useRouteError } from 'react-router';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as { message: string };

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-xl font-semibold">Something Went Wrong</h2>
        <p className="text-muted-foreground text-sm">{error?.message || 'We hit an unexpected error on our end'}</p>
      </div>

      <Button variant="primary" onClick={() => navigate('/dashboard')}>
        {__('Back to Dashboard', 'yay-bulk-order')}
      </Button>
    </div>
  );
}
