import { getContext, getElement, store } from '@wordpress/interactivity';

const STORE_NAMESPACE = 'yay-bulk-order/purchase-list';

const { state } = store(
  STORE_NAMESPACE,
  {
    state: {
      view: 'list',
      get isListView() {
        return state.view === 'list';
      },
      get isCreateView() {
        return state.view === 'create';
      },
      get isEditView() {
        return state.view === 'edit';
      },
    },
    actions: {
      *navigate(event: MouseEvent) {
        const { ref } = getElement();

        if (isValidLink(ref) && isValidEvent(event)) {
          event.preventDefault();

          const { actions } = yield import('@wordpress/interactivity-router');

          yield actions.navigate(ref.href);
        }
      },
      *prefetchOnHover() {
        const { ref } = getElement();

        if (isValidLink(ref)) {
          const { actions } = yield import('@wordpress/interactivity-router');

          yield actions.prefetch(ref.href);
        }
      },
      showListView() {
        state.view = 'list';
      },
      showCreateView() {
        state.view = 'create';
      },
      showEditView() {
        state.view = 'edit';
      },
    },
    callbacks: {
      *prefetch() {
        const { ref } = getElement();
        if (isValidLink(ref)) {
          const { actions } = yield import('@wordpress/interactivity-router');

          yield actions.prefetch(ref.href);
        }
      },
      onRender() {
        // const context = getContext<ProductTableContext>();
        // const globalConfig = getGlobalConfig();
        // console.log('onRender', {
        //   globalConfig,
        //   tableState: context.tableState,
        //   productQuery: context.formAttributes.productQuery,
        // });
      },
    },
  },
  { lock: true },
);

console.log(state);

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
