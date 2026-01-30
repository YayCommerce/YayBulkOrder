import { useEffect } from 'react';

/**
 * Warn user on tab close or reload if condition is true.
 * Works in all major browsers. No custom message possible.
 */
export function useBeforeUnloadWarning(shouldWarn: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldWarn) return;
      e.preventDefault();
      e.returnValue = true; // legacy support, e.g. Chrome/Edge < 119 (Release date: 2023-11-02)
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldWarn]);
}
