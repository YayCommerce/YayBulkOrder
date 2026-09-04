export {};

interface WPMediaFrame {
  open: () => void;
  close: () => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  state: (state?: string) => any;
}

interface WPMediaFunction {
  (options?: Record<string, unknown>): WPMediaFrame;
  frames: Record<string, WPMediaFrame>;
}

declare global {
  interface Window {
    wp: {
      media: WPMediaFunction;
      [key: string]: any;
    };
  }
}
