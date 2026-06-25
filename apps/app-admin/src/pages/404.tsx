import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h2 className="text-foreground mb-4 text-xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground text-sm">Looks like this page has gone missing</p>
      </div>

      <Button variant="primary" onClick={() => navigate('/dashboard')}>
        {__('Back to Dashboard', 'yay-bulk-order')}
      </Button>
    </div>
  );
}
