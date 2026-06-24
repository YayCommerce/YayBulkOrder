import { useEffect, useState } from 'react';
import { useBlocker } from 'react-router';

/**
 * Hook that guards unsaved form changes.
 * Returns control for showing custom modal.
 */
export function useRouteLeaveGuard(shouldBlock: boolean) {
  const [showDialog, setShowDialog] = useState(false);

  const blocker = useBlocker(shouldBlock);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowDialog(true);
    }
  }, [blocker]);

  // Confirm Dialog actions
  const confirmLeave = () => {
    setShowDialog(false);
    blocker.proceed?.();
  };

  const cancelLeave = () => {
    setShowDialog(false);
    blocker.reset?.();
  };

  return { showDialog, confirmLeave, cancelLeave };
}
