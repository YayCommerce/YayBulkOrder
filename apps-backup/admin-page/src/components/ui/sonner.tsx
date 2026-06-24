import { Toaster as Sonner, toast, ToasterProps } from 'sonner';

import { useTheme } from './theme-provider';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      position="top-center"
      theme={theme}
      className="toaster group"
      toastOptions={{
        className: 'p-2.5! justify-center',
      }}
      style={
        {
          '--width': 'max-content',
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius-md)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
