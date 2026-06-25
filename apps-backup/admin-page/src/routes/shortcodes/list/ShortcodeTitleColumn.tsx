import { useNavigate } from 'react-router';

import { useSetShortcodeQuery } from '@/lib/queries/shortcodes.queries';
import { ShortcodeConfig } from '@/lib/schemas/shortcodes.schema';

export function ShortcodeTitleColumn({ shortcodeConfig }: { shortcodeConfig: ShortcodeConfig }) {
  const navigate = useNavigate();
  const setShortcodeQuery = useSetShortcodeQuery();

  function onEdit() {
    setShortcodeQuery(shortcodeConfig.id, shortcodeConfig);
    navigate(`/shortcodes/${shortcodeConfig.id}`);
  }

  return (
    <div className="cursor-pointer font-medium hover:underline" onClick={onEdit}>
      {shortcodeConfig.title}
    </div>
  );
}
