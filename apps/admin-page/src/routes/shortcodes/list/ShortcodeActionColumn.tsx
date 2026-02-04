import { Bolt, Trash } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useDeleteShortcodeMutation, useSetShortcodeQuery } from '@/lib/queries/shortcodes.queries';
import { ShortcodeConfig } from '@/lib/schemas/shortcodes.schema';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';

export function ShortcodeActionColumn({ shortcodeConfig }: { shortcodeConfig: ShortcodeConfig }) {
  const navigate = useNavigate();
  const deleteShortcodeMutation = useDeleteShortcodeMutation();
  const setShortcodeQuery = useSetShortcodeQuery();

  function onEdit() {
    setShortcodeQuery(shortcodeConfig.id, shortcodeConfig);
    navigate(`/shortcodes/${shortcodeConfig.id}`);
  }

  function onDelete() {
    if (deleteShortcodeMutation.isPending) return;

    if (!window.confirm('Are you sure you want to delete this shortcode?')) {
      return;
    }

    deleteShortcodeMutation.mutate(shortcodeConfig.id);
  }

  return (
    <div className="flex w-10 items-center justify-end gap-2">
      <CopyButton content={`[ybo-form-shortcode id="${shortcodeConfig.id}"]`} />

      <Button variant="outline" size="icon" onClick={onEdit}>
        <Bolt className="size-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onDelete}>
        <Trash className="size-4" />
      </Button>
    </div>
  );
}
