import { getContext, getElement, store } from '@wordpress/interactivity';

import { checkViewIsReady } from '@yay-bulk-order/view';

type ServerState = {
  state: {
    isBlockTheme: boolean;
    pageSize: number;
  };
};

type Context = {
  config: {
    queryId: number;
    forcePageReload: boolean;
  };
  queryContext: {
    page: number;
    filter: 'all' | 'in-stock' | 'on-sale';
  };
  queryResult: {
    totalLength: number;
  };
};

const storeDef = {
  state: {
    get currentPage(): number {
      const context = getContext<Context>();
      return context.queryContext.page;
    },
  },
  actions: {
    *navigate(event: MouseEvent) {
      const { ref } = getElement();

      if (isValidLink(ref) && isValidEvent(event)) {
        event.preventDefault();

        const { actions } = yield import('@wordpress/interactivity-router');

        console.log('navigate', ref.href);
        yield actions.navigate(ref.href);
      }
    },
    *prefetchOnHover() {
      console.log('prefetchOnHover');
      const { ref } = getElement();

      if (isValidLink(ref)) {
        const { actions } = yield import('@wordpress/interactivity-router');

        yield actions.prefetch(ref.href);
      }
    },
  },
  callbacks: {
    *prefetch() {
      console.log('prefetch');
      const { ref } = getElement();
      if (isValidLink(ref)) {
        const { actions } = yield import('@wordpress/interactivity-router');

        yield actions.prefetch(ref.href);
      }
    },
    onRender() {
      const context = getContext<Context>();
      console.log('onRender', {
        isBlockTheme: state.isBlockTheme,
        config: context.config.queryId,
        page: context.queryContext.page,
        filter: context.queryContext.filter,
        totalLength: context.queryResult.totalLength,
      });
      checkViewIsReady();
    },
  },
};

type Store = ServerState & typeof storeDef;

const { state } = store<Store>('yay-bulk-order/bulk-order-form', storeDef, { lock: true });

function isValidLink(ref: HTMLElement | null): ref is HTMLAnchorElement {
  return (
    ref !== null &&
    ref instanceof window.HTMLAnchorElement &&
    !!ref.href &&
    (!ref.target || ref.target === '_self') &&
    ref.origin === window.location.origin
  );
}

function isValidEvent(event: MouseEvent): boolean {
  return (
    event.button === 0 && // Left clicks only.
    !event.metaKey && // Open in new tab (Mac).
    !event.ctrlKey && // Open in new tab (Windows).
    !event.altKey && // Download.
    !event.shiftKey &&
    !event.defaultPrevented
  );
}
