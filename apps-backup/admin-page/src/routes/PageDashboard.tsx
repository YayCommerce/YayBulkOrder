import { useEffect } from 'react';

import { checkUtilsIsReady } from '@yay-bulk-order/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PageDashboard() {
  useEffect(() => {
    checkUtilsIsReady();
  }, []);

  return (
    <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-6 **:[a]:mx-1 **:[a]:text-primary **:[a]:hover:underline">
      <Card>
        <CardHeader>
          <CardTitle>Guides: If Site is using Block Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Explain how Patterns works.
            <br />
            Showcase Bulk Order Form Patterns.
            <br />
            Show Link to
            <a
              href="/wp-admin/site-editor.php?p=%2Fpattern&postType=wp_block&categoryId=yay-bulk-order"
              target="_blank"
            >
              Pattern Category
            </a>
            <br />
            Show Pattern Documentation Link.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Guides: If Site is using Classic Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Explain how Shortcode works.
            <br />
            Suggest Brandy Theme and Patterns Design.
            <br />
            Show Link to
            <a href="#/shortcodes">Shortcode Configuration Page</a>
            <br />
            Show Shortcode Documentation Link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
