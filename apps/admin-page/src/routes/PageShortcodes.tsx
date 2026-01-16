import { useIsMutating } from '@tanstack/react-query';
import { useMatch, useNavigate, useParams } from 'react-router';

import { Sheet } from '@/components/ui/sheet';

import ShortcodeEdit from './shortcodes/form/ShortcodeEdit';
import ShortcodeNew from './shortcodes/form/ShortcodeNew';
import ShortcodeList from './shortcodes/ShortcodeList';

export default function PageShortcodes() {
  const navigate = useNavigate();
  const { formId } = useParams();

  const isShortcodeCreateRoute = !!useMatch('/shortcodes/new');
  const isShortcodeEditRoute = !!useMatch('/shortcodes/:formId');

  const isMutatingTable = useIsMutating({ mutationKey: ['shortcodes'] }) > 0;

  const shortcodeId = isShortcodeEditRoute && formId && formId !== 'new' ? Number(formId) : null;

  const setIsOpenSheet = (open: boolean) => {
    if (isMutatingTable) return;
    if (!open) navigate('/shortcodes');
  };

  return (
    <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-6">
      <ShortcodeList />

      <Sheet open={isShortcodeCreateRoute || isShortcodeEditRoute} onOpenChange={setIsOpenSheet}>
        {isShortcodeCreateRoute && <ShortcodeNew />}
        {isShortcodeEditRoute && shortcodeId && <ShortcodeEdit editId={shortcodeId} />}
      </Sheet>
    </div>
  );
}
