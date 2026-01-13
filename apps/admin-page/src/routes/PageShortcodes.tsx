import { useIsMutating } from '@tanstack/react-query';
import { useMatch, useNavigate } from 'react-router';

import { Sheet } from '@/components/ui/sheet';

import ShortcodeList from './shortcodes/ShortcodeList';
import ShortcodeSheetEdit from './shortcodes/ShortcodeSheetEdit';
import ShortcodeSheetNew from './shortcodes/ShortcodeSheetNew';

export default function PageShortcodes() {
  const navigate = useNavigate();
  const isIndexRoute = useMatch('/shortcodes');
  const isNewRoute = useMatch('/shortcodes/new');
  const isEditRoute = useMatch('/shortcodes/:formId');

  const isOpenSheet = isIndexRoute === null;
  const isMutatingTable = useIsMutating({ mutationKey: ['shortcodes'] }) > 0;

  function setIsOpenSheet(open: boolean) {
    if (isMutatingTable) return;

    if (!open) {
      navigate('/shortcodes');
    }
  }

  return (
    <>
      <ShortcodeList />
      <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
        {isNewRoute && <ShortcodeSheetNew />}
        {isEditRoute && <ShortcodeSheetEdit />}
      </Sheet>
    </>
  );
}
