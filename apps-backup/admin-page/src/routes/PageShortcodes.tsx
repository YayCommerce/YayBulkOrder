import { useIsMutating } from '@tanstack/react-query';
import { useMatch, useNavigate, useParams } from 'react-router';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import ShortcodeEditForm from './shortcodes/ShortcodeEditForm';
import ShortcodeList from './shortcodes/ShortcodeList';
import ShortcodeNewForm from './shortcodes/ShortcodeNewForm';

export default function PageShortcodes() {
  const navigate = useNavigate();

  const { shortcodeId: shortcodeIdParam } = useParams();
  const shortcodeId = shortcodeIdParam !== undefined ? Number(shortcodeIdParam) : undefined;

  const isShortcodeCreateRoute = !!useMatch('/shortcodes/new');
  const isShortcodeEditRoute = !!useMatch('/shortcodes/:shortcodeId');

  const isMutatingShortcode = useIsMutating({ mutationKey: ['shortcodes'] }) >= 1;

  return (
    <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-6 px-6">
      <ShortcodeList />

      <Sheet
        open={isShortcodeCreateRoute}
        onOpenChange={(open) => {
          if (!open && !isMutatingShortcode) {
            navigate('/shortcodes');
          }
        }}
      >
        <SheetContent>
          <ShortcodeNewForm />
        </SheetContent>
      </Sheet>

      <Sheet
        open={isShortcodeEditRoute && Number.isInteger(shortcodeId)}
        onOpenChange={(open) => {
          if (!open && !isMutatingShortcode) {
            navigate('/shortcodes');
          }
        }}
      >
        <SheetContent>{shortcodeId !== undefined && <ShortcodeEditForm editId={shortcodeId} />}</SheetContent>
      </Sheet>
    </div>
  );
}
