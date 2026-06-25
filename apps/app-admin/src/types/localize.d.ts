import { AdminData, Meta } from '@yay-bulk-order/common/src/schemas';

declare global {
  interface Window {
    yayBulkOrderMeta: Meta;
    yayBulkOrderAdminData: AdminData;
  }
}

declare module 'rooks' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyFunction = (...args: any[]) => any;
  type DebounceOptions = {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  };

  declare function useDebounceFn<F extends AnyFunction>(
    func: F,
    delay: number,
    options?: DebounceOptions,
  ): [(...args: Parameters<F>) => void, boolean];
}

export {};
