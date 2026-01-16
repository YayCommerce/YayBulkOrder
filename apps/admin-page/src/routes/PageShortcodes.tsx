import { useMatch, useParams } from 'react-router';

import ShortcodeEdit from './shortcodes/form/ShortcodeEdit';
import ShortcodeNew from './shortcodes/form/ShortcodeNew';
import ShortcodeList from './shortcodes/ShortcodeList';

export default function PageShortcodes() {
  const { formId } = useParams();

  const isShortcodeCreateRoute = !!useMatch('/shortcodes/new');
  const isShortcodeEditRoute = !!useMatch('/shortcodes/:formId');

  const shortcodeId = isShortcodeEditRoute && formId && formId !== 'new' ? Number(formId) : null;

  return (
    <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-6">
      <ShortcodeList />

      {isShortcodeCreateRoute && <ShortcodeNew />}
      {isShortcodeEditRoute && shortcodeId && <ShortcodeEdit editId={shortcodeId} />}
    </div>
  );
}
